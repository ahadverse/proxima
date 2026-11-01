import { youtubeId, type VideoReviewInput } from '@/shared';
import { CacheTags, revalidateStorefront } from '../../lib/revalidate';
import { ApiError } from '../../utils/ApiError';
import { VideoReview, toVideoReviewDTO } from './video-review.model';

export async function listPublic() {
  const items = await VideoReview.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
  return items.map(toVideoReviewDTO);
}

export async function listAll() {
  const items = await VideoReview.find().sort({ order: 1, createdAt: -1 }).lean();
  return items.map(toVideoReviewDTO);
}

function normalize(input: VideoReviewInput) {
  return { ...input, youtubeId: youtubeId(input.url)! };
}

export async function create(input: VideoReviewInput) {
  const last = await VideoReview.findOne().sort({ order: -1 }).select('order').lean();
  const review = await VideoReview.create({ ...normalize(input), order: (last?.order ?? -1) + 1 });
  revalidateStorefront([CacheTags.videoReviews]);
  return toVideoReviewDTO(review);
}

export async function update(id: string, input: VideoReviewInput) {
  const review = await VideoReview.findByIdAndUpdate(id, { $set: normalize(input) }, { new: true }).lean();
  if (!review) throw ApiError.notFound('Video review not found');
  revalidateStorefront([CacheTags.videoReviews]);
  return toVideoReviewDTO(review);
}

export async function remove(id: string) {
  const deleted = await VideoReview.findByIdAndDelete(id).lean();
  if (!deleted) throw ApiError.notFound('Video review not found');
  revalidateStorefront([CacheTags.videoReviews]);
}

export async function reorder(ids: string[]) {
  await VideoReview.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
  revalidateStorefront([CacheTags.videoReviews]);
  return listAll();
}
