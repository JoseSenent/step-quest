import type { RouteModel } from "./RouterProvider";
import { useRouter } from "./useRouter";

type RoutesProps = {
  routes: Record<RouteModel, React.ComponentType>;
};

export function Routes({ routes }: RoutesProps) {
  const { route } = useRouter();
  const Component = routes[route] || (() => <p>404 Not Found</p>);

  return <Component />;
}
