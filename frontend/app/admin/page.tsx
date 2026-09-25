"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { RatingStars } from "@/components/rating-stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAdmin } from "@/lib/auth/session";
import { assignRole, createRole, deleteRole, listRoles } from "@/lib/api/auth";
import { friendlyMessage } from "@/lib/api/client";
import { createHotel, deleteHotel, listHotels, queueRoomGeneration } from "@/lib/api/hotel";
import { formatINR } from "@/lib/format";

export default function AdminPage() {
  return (
    <RequireAdmin>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Host console
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Manage stays
          </h1>
        </div>

        <Tabs defaultValue="stays" className="w-full">
          <TabsList>
            <TabsTrigger value="stays">Stays</TabsTrigger>
            <TabsTrigger value="rooms">Room generation</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          <TabsContent value="stays" className="mt-5">
            <StaysSection />
          </TabsContent>
          <TabsContent value="rooms" className="mt-5">
            <RoomsSection />
          </TabsContent>
          <TabsContent value="roles" className="mt-5">
            <RolesSection />
          </TabsContent>
        </Tabs>
      </div>
    </RequireAdmin>
  );
}

// --- Stays ---------------------------------------------------------------

function StaysSection() {
  const queryClient = useQueryClient();
  const { data: hotels, isPending } = useQuery({ queryKey: ["hotels"], queryFn: () => listHotels() });

  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [rating, setRating] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["hotels"] });

  const create = useMutation({
    mutationFn: () =>
      createHotel({
        name: name.trim(),
        address: address.trim(),
        location: location.trim(),
        ...(rating ? { rating: Number(rating) } : null),
      }),
    onSuccess: (hotel) => {
      toast.success(`“${hotel.name}” is live.`);
      setName("");
      setAddress("");
      setLocation("");
      setRating("");
      invalidate();
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteHotel(id),
    onSuccess: () => {
      toast.success("Stay removed.");
      setConfirmDelete(null);
      invalidate();
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <form
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 lg:col-span-1"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <h2 className="font-display text-xl font-semibold">Add a stay</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hotel-name">Name</Label>
          <Input id="hotel-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="The Fern Residency" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hotel-address">Address</Label>
          <Input id="hotel-address" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="14 Palm Grove Road" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hotel-location">Location</Label>
          <Input id="hotel-location" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Goa" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hotel-rating">Rating (1–5, optional)</Label>
          <Input id="hotel-rating" type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4" />
        </div>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add stay
        </Button>
      </form>

      <div className="flex flex-col gap-3 lg:col-span-2">
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading stays…</p>
        ) : !hotels || hotels.length === 0 ? (
          <EmptyState
            title="No stays yet"
            body="Add the first stay with the form — it will appear on the homepage immediately."
            actionHref="/"
            actionLabel="View homepage"
          />
        ) : (
          hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display truncate text-lg leading-snug font-semibold">{hotel.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {hotel.address} · {hotel.location}
                  {typeof hotel.price === "number" ? ` · ${formatINR(hotel.price)}/night` : ""}
                </p>
                <div className="mt-1">
                  <RatingStars rating={hotel.rating} />
                </div>
              </div>
              {confirmDelete === hotel.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Remove?</span>
                  <Button size="sm" variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate(hotel.id)}>
                    Yes, remove
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                    Keep
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(hotel.id)}>
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- Room generation ------------------------------------------------------

function RoomsSection() {
  const [roomCategoryId, setRoomCategoryId] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [priceOverride, setPriceOverride] = React.useState("");
  const [batchSize, setBatchSize] = React.useState("");

  const queue = useMutation({
    mutationFn: () =>
      queueRoomGeneration({
        roomCategoryId: Number(roomCategoryId),
        // datetime-local has no zone/seconds; full ISO always validates.
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        ...(priceOverride ? { priceOverride: Number(priceOverride) } : null),
        ...(batchSize ? { batchSize: Number(batchSize) } : null),
      }),
    onSuccess: () => {
      toast.success("Room generation queued. The service reports no progress — rooms appear once the worker finishes.");
      setRoomCategoryId("");
      setStartDate("");
      setEndDate("");
      setPriceOverride("");
      setBatchSize("");
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <form
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 lg:col-span-1"
        onSubmit={(e) => {
          e.preventDefault();
          queue.mutate();
        }}
      >
        <h2 className="font-display text-xl font-semibold">Generate rooms</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rg-category">Room category ID</Label>
          <Input id="rg-category" type="number" min={1} required value={roomCategoryId} onChange={(e) => setRoomCategoryId(e.target.value)} placeholder="3" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rg-start">Start</Label>
            <Input id="rg-start" type="datetime-local" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rg-end">End</Label>
            <Input id="rg-end" type="datetime-local" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rg-price">Price override</Label>
            <Input id="rg-price" type="number" min={1} value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rg-batch">Batch size</Label>
            <Input id="rg-batch" type="number" min={1} value={batchSize} onChange={(e) => setBatchSize(e.target.value)} placeholder="100" />
          </div>
        </div>
        <Button type="submit" disabled={queue.isPending}>
          {queue.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Queue job
        </Button>
      </form>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 lg:col-span-2">
        <h2 className="font-display text-xl font-semibold">How this works</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Rooms are generated by a background worker for the category and date range you pick.</li>
          <li>The service answers with an empty confirmation — there is no job id, so progress can&apos;t be tracked from here yet.</li>
          <li>Room categories have no read endpoint, so use a known category ID (check the hotel service database).</li>
        </ul>
      </div>
    </div>
  );
}

// --- Roles -----------------------------------------------------------------

function RolesSection() {
  const queryClient = useQueryClient();
  const { data: roles, isPending } = useQuery({ queryKey: ["roles"], queryFn: listRoles });

  const [roleName, setRoleName] = React.useState("");
  const [roleDescription, setRoleDescription] = React.useState("");
  const [assignUserId, setAssignUserId] = React.useState("");
  const [assignRoleId, setAssignRoleId] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["roles"] });

  const create = useMutation({
    mutationFn: () => createRole({ name: roleName.trim(), description: roleDescription.trim() || undefined }),
    onSuccess: () => {
      toast.success("Role created.");
      setRoleName("");
      setRoleDescription("");
      invalidate();
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      toast.success("Role deleted.");
      setConfirmDelete(null);
      invalidate();
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  const assign = useMutation({
    mutationFn: () => assignRole(assignUserId.trim(), assignRoleId.trim()),
    onSuccess: () => {
      toast.success("Role assigned.");
      setAssignUserId("");
      setAssignRoleId("");
    },
    onError: (err) => toast.error(friendlyMessage(err)),
  });

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-1">
        <form
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <h2 className="font-display text-xl font-semibold">New role</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-name">Name</Label>
            <Input id="role-name" required value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="moderator" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-desc">Description</Label>
            <Input id="role-desc" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} placeholder="Optional" />
          </div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Create role
          </Button>
        </form>

        <form
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            assign.mutate();
          }}
        >
          <h2 className="font-display text-xl font-semibold">Assign role</h2>
          <p className="-mt-2 text-xs text-muted-foreground">Requires an admin session on the auth service.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assign-user">User ID</Label>
              <Input id="assign-user" type="number" min={1} required value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} placeholder="7" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assign-role">Role ID</Label>
              <Input id="assign-role" type="number" min={1} required value={assignRoleId} onChange={(e) => setAssignRoleId(e.target.value)} placeholder="2" />
            </div>
          </div>
          <Button type="submit" disabled={assign.isPending}>
            {assign.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Assign
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-3 lg:col-span-2">
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading roles…</p>
        ) : !roles || roles.length === 0 ? (
          <EmptyState title="No roles yet" body="Create the first role with the form — user, admin and moderator are the usual starting set." actionHref="/admin" actionLabel="Stay here" />
        ) : (
          roles.map((role) => (
            <div key={role.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">
                  {role.name} <span className="ml-1 text-xs font-normal text-muted-foreground">#{role.id}</span>
                </p>
                {role.description && <p className="truncate text-sm text-muted-foreground">{role.description}</p>}
              </div>
              {confirmDelete === role.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Delete?</span>
                  <Button size="sm" variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate(role.id)}>
                    Yes, delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                    Keep
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(role.id)}>
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              )}
            </div>
          ))
        )}
        <Separator />
        <p className="text-xs text-muted-foreground">
          Role checks happen per request on the auth service — the JWT itself carries no roles, so this console can&apos;t display who holds what.
        </p>
      </div>
    </div>
  );
}
