import { useLocation } from "@solidjs/router";

export const RoutePath = () => {
  const location = useLocation();

  const segments = () =>
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((s) => s.replace("-", " "));

  if (segments().length <= 1) return null;

  return (
    <div class="text-xs font-semibold opacity-60 truncate">
      {segments().join(" / ")}
    </div>
  );
};
