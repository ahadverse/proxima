import {
  DOWNLOAD_URL_TTL_SECONDS,
  MEMBERSHIP_COVERED_TYPES,
  type LibraryItemDTO,
  type LibrarySource,
} from '@/shared';
import { PRIVATE_BUCKET, presignDownload } from '../../lib/r2';
import { ApiError } from '../../utils/ApiError';
import { Order } from '../order/order.model';
import { toCardDTO, toDetailDTO } from '../product/product.mapper';
import { CARD_FIELDS, CATEGORY_POPULATE, Product } from '../product/product.model';
import { User } from '../user/user.model';
import { DownloadLog } from './download-log.model';
import { canAccess } from './entitlement.service';

interface Acquisition {
  source: LibrarySource;
  at: Date;
}

export async function getLibrary(userId: string): Promise<LibraryItemDTO[]> {
  const [user, orders] = await Promise.all([
    User.findById(userId).select('membership isBanned').lean(),
    Order.find({ user: userId, status: 'paid' }).select('items total payment.paidAt createdAt').sort({ createdAt: 1 }).lean(),
  ]);
  if (!user || user.isBanned) return [];

  const acquired = new Map<string, Acquisition>();
  for (const order of orders) {
    for (const item of order.items) {
      const id = String(item.product);
      if (acquired.has(id)) continue;
      acquired.set(id, {
        source: item.price === 0 ? 'free' : 'purchase',
        at: order.payment?.paidAt ?? order.createdAt,
      });
    }
  }

  if (user.membership?.active) {
    const covered = await Product.find({ status: 'published', type: { $in: MEMBERSHIP_COVERED_TYPES } }).select('_id').lean();
    for (const product of covered) {
      const id = String(product._id);
      if (!acquired.has(id)) {
        acquired.set(id, { source: 'membership', at: user.membership.activatedAt ?? new Date() });
      }
    }
  }

  if (acquired.size === 0) return [];

  const products = await Product.find({ _id: { $in: [...acquired.keys()] }, type: { $ne: 'membership' } })
    .select(`${CARD_FIELDS} version techTags changelog status +githubUrl +file +demoAdmin`)
    .populate(CATEGORY_POPULATE)
    .lean();

  return products
    .map((product) => {
      const acquisition = acquired.get(String(product._id))!;
      const detail = toDetailDTO(product);
      const demo = product.demoAdmin;
      return {
        product: { ...toCardDTO(product), version: detail.version, techTags: detail.techTags, changelog: detail.changelog },
        githubUrl: product.githubUrl ?? '',
        hasFile: Boolean(product.file?.key),
        fileName: product.file?.name ?? '',
        fileSize: product.file?.size ?? 0,
        demoAdmin: demo && (demo.url || demo.email) ? { url: demo.url, email: demo.email, password: demo.password } : null,
        source: acquisition.source,
        acquiredAt: new Date(acquisition.at).toISOString(),
      };
    })
    .sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt));
}

export async function createDownloadLink(userId: string, productId: string, meta: { ip: string; userAgent: string }) {
  const product = await Product.findById(productId).select('type status slug +file').lean();
  if (!product) throw ApiError.notFound('Product not found');

  const allowed = await canAccess(userId, product);
  if (!allowed) throw ApiError.forbidden('You have not purchased this product', 'NOT_ENTITLED');
  if (!product.file?.key) throw ApiError.notFound('No download file is available for this product yet', 'NO_FILE');

  const url = await presignDownload({
    bucket: PRIVATE_BUCKET,
    key: product.file.key,
    fileName: product.file.name || `${product.slug}.zip`,
    expiresIn: DOWNLOAD_URL_TTL_SECONDS,
  });
  await DownloadLog.create({ user: userId, product: product._id, ip: meta.ip, userAgent: meta.userAgent.slice(0, 300) });
  return { url, fileName: product.file.name, expiresIn: DOWNLOAD_URL_TTL_SECONDS };
}
