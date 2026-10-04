import type { Activity } from "@/backend";
import { ActivityKind } from "@/backend";
import { ActivityRow } from "@/components/ActivityRow";
import { Layout } from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createActor } from "@/lib/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useState } from "react";

type InboxTab = "likes" | "comments" | "followers" | "mentions";

interface TabConfig {
  value: InboxTab;
  label: string;
  kind: ActivityKind;
  icon: typeof Heart;
  emptyTitle: string;
  emptyBody: string;
}

const TABS: TabConfig[] = [
  {
    value: "likes",
    label: "Likes",
    kind: ActivityKind.like,
    icon: Heart,
    emptyTitle: "No likes yet",
    emptyBody: "When someone likes your reel, it shows up here.",
  },
  {
    value: "comments",
    label: "Comments",
    kind: ActivityKind.comment,
    icon: MessageCircle,
    emptyTitle: "No comments yet",
    emptyBody: "Conversations on your reels will appear here.",
  },
  {
    value: "followers",
    label: "Followers",
    kind: ActivityKind.follow,
    icon: UserPlus,
    emptyTitle: "No new followers",
    emptyBody: "People who follow you will be listed here.",
  },
  {
    value: "mentions",
    label: "Mentions",
    kind: ActivityKind.mention,
    icon: Bell,
    emptyTitle: "No mentions yet",
    emptyBody: "Reels and comments that tag you will appear here.",
  },
];

/** Fetch recent activity of one kind for the signed-in user. */
function useActivity(kind: ActivityKind) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["activity", kind],
    queryFn: async (): Promise<Activity[]> => {
      if (!actor) return [];
      return actor.listActivity(kind);
    },
    enabled: !!actor && !isFetching,
  });
}

function ActivityList({ kind }: { kind: ActivityKind }) {
  const { data, isLoading, isError, refetch } = useActivity(kind);
  const config = TABS.find((tab) => tab.kind === kind);
  const EmptyIcon = config?.icon ?? Bell;

  if (isLoading) {
    return (
      <ul data-ocid="inbox.loading_state" className="space-y-1">
        {Array.from({ length: 6 }, (_, i) => `inbox-skeleton-${i}`).map(
          (id) => (
            <li key={id} className="flex items-center gap-3 px-2 py-2.5">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/5 rounded-full" />
                <Skeleton className="h-3 w-3/5 rounded-full" />
              </div>
              <Skeleton className="h-3 w-8 rounded-full" />
            </li>
          ),
        )}
      </ul>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="inbox.error_state"
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center"
      >
        <p className="font-display text-base font-semibold text-foreground">
          Couldn't load activity
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Something went wrong while fetching your inbox. Please try again.
        </p>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          data-ocid="inbox.retry_button"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div
        data-ocid="inbox.empty_state"
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-14 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <EmptyIcon className="size-6" />
        </span>
        <p className="font-display text-base font-semibold text-foreground">
          {config?.emptyTitle ?? "Nothing here yet"}
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          {config?.emptyBody ?? "New activity will appear here."}
        </p>
      </div>
    );
  }

  return (
    <ul data-ocid="inbox.list" className="space-y-1">
      {items.map((activity, index) => (
        <ActivityRow
          key={activity.id.toString()}
          activity={activity}
          index={index + 1}
        />
      ))}
    </ul>
  );
}

/** Inbox with Likes, Comments, Followers, and Mentions activity tabs. */
export function InboxPage() {
  const [tab, setTab] = useState<InboxTab>("likes");

  return (
    <RequireAuth>
      <Layout title="Inbox">
        <div data-ocid="inbox.page" className="space-y-4">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as InboxTab)}
            className="gap-4"
          >
            <TabsList
              data-ocid="inbox.tabs"
              className="h-11 w-full rounded-full bg-secondary p-1"
            >
              {TABS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  data-ocid={`inbox.tab.${item.value}`}
                  className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {TABS.map((item) => (
              <TabsContent
                key={item.value}
                value={item.value}
                data-ocid={`inbox.panel.${item.value}`}
              >
                <ActivityList kind={item.kind} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Layout>
    </RequireAuth>
  );
}
