"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/rating-stars";
import { createReview, listReviews } from "@/lib/api/hotel";
import { friendlyMessage } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";
import { formatDateLabel } from "@/lib/format";

/** Guest reviews. Anyone can read; the Hotel service only accepts a review from a
 *  guest whose confirmed stay has checked out, and shows why otherwise. */
export function HotelReviews({ hotelId }: { hotelId: number }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: reviews = [], isPending } = useQuery({
    queryKey: ["reviews", hotelId],
    queryFn: () => listReviews(hotelId),
  });

  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");

  const post = useMutation({
    mutationFn: () => createReview(hotelId, { rating, comment: comment.trim() }),
    onSuccess: () => {
      toast.success("Thanks — your review is live.");
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", hotelId] });
      // The hotel's average rating changed too.
      queryClient.invalidateQueries({ queryKey: ["hotel", String(hotelId)] });
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  const alreadyReviewed = user ? reviews.some((r) => r.userId === user.id) : false;

  return (
    <section id="reviews" className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-xl font-semibold">Guest reviews</h2>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — guests can review after their stay.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-1.5 border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <RatingStars rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  Verified guest · {formatDateLabel(review.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {!user ? (
        <p className="text-sm text-muted-foreground">
          Stayed here?{" "}
          <Link href={`/login?next=${encodeURIComponent(`/hotel/${hotelId}#reviews`)}`} className="font-medium text-primary hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      ) : alreadyReviewed ? null : (
        <form
          className="flex flex-col gap-3 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            post.mutate();
          }}
        >
          <fieldset className="flex items-center gap-1">
            <legend className="mb-1.5 text-xs font-medium text-muted-foreground">Your rating</legend>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
                className="rounded p-0.5"
              >
                <Star className={cn("size-6", n <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
              </button>
            ))}
          </fieldset>
          <Textarea
            aria-label="Your review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What stood out about your stay?"
            minLength={10}
            maxLength={2000}
            required
          />
          <Button type="submit" className="w-fit" disabled={rating === 0 || comment.trim().length < 10 || post.isPending}>
            {post.isPending && <Loader2 className="size-4 animate-spin" />}
            Post review
          </Button>
        </form>
      )}
    </section>
  );
}
