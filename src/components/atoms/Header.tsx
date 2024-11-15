import Logo from "@/components/atoms/Logo";
import ViewPicker from "@/components/templates/ViewPicker";
import { Button } from "@/components/ui/button";
import { headerHeight, sidebarWidth } from "@/lib/consts";

interface Props {
  scrollToCurrentDate: () => void;
  month: string;
  year: string;
}

export default function Header({ scrollToCurrentDate, month, year }: Props) {
  return (
    <nav
      style={{ height: headerHeight, width: `calc(100vw - ${sidebarWidth}px)` }}
      className="flex fixed left-0 top-0 items-center justify-between border-b bg-background px-2 z-50 gap-4">
      <div className="flex flex-row items-center justify-center gap-4">
        <Logo />
        <p className="font-semibold mt-1">
          {month} {year}
        </p>
      </div>
      <span className="flex gap-2">
        <ViewPicker />
        <Button
          className="text-text-primary shadow-text-tertiary shadow-sm bg-text-tertiary/20"
          onClick={() => scrollToCurrentDate()}>
          <p>Today</p>
        </Button>
      </span>
    </nav>
  );
}
