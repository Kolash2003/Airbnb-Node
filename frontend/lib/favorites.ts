// Per-user wishlist, stored by the Hotel service (/favorites) so it follows the
// account across devices. Signed-out visitors are sent to log in.

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { friendlyMessage } from "@/lib/api/client";
import { listFavoriteIds, setFavorite } from "@/lib/api/hotel";
import { useSession } from "@/lib/auth/session";

export function useFavorites() {
  const { user } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["favorites", user?.id];

  const { data: favorites = [] } = useQuery({
    queryKey,
    queryFn: listFavoriteIds,
    enabled: Boolean(user),
  });

  // Optimistic: the heart flips instantly and rolls back if the call fails.
  const mutation = useMutation({
    mutationFn: ({ hotelId, saved }: { hotelId: number; saved: boolean }) =>
      setFavorite(hotelId, saved),
    onMutate: async ({ hotelId, saved }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<number[]>(queryKey) ?? [];
      queryClient.setQueryData<number[]>(
        queryKey,
        saved ? [hotelId, ...previous] : previous.filter((id) => id !== hotelId),
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      toast.error(friendlyMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleFavorite = React.useCallback(
    (hotelId: number) => {
      if (!user) {
        toast("Sign in to save stays to your wishlist.");
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      mutation.mutate({ hotelId, saved: !favorites.includes(hotelId) });
    },
    [user, router, mutation, favorites],
  );

  return { favorites, toggleFavorite };
}
