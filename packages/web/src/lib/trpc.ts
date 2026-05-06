// Stub tRPC client — returns mock data so pages render without a live API
function makeQuery(data: unknown) {
  return () => ({
    data,
    isLoading: false,
    refetch: () => {},
    isPending: false,
  });
}

function makeMutation(fn?: () => void) {
  return () => ({
    mutate: fn ?? (() => {}),
    mutateAsync: fn ? async () => fn() : async () => {},
    isPending: false,
  });
}

const stub: Record<string, unknown> = {};

function deepProxy(path: string[]): unknown {
  return new Proxy(
    {},
    {
      get(_t, key: string) {
        const next = [...path, key];
        if (key === "useQuery") return makeQuery(null);
        if (key === "useMutation") return makeMutation();
        if (key === "useInfiniteQuery") return makeQuery({ pages: [], pageParams: [] });
        return deepProxy(next);
      },
    }
  );
}

export const trpc = deepProxy([]) as any;
