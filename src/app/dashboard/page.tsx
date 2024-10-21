"use client";

import Header from "@/components/atoms/Header";
import TimeBlock from "@/components/atoms/TimeBlock";
import Grid from "@/components/templates/Grid";
import { useSettingStore } from "@/lib/stores/settings";
import { calculateDaysToPreviousMonday, getDayWithDate } from "@/lib/utils";
import dayjs from "dayjs";

import { useCallback, useRef, useState } from "react";

export default function Dashboard() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [week, setWeek] = useState(dayjs(new Date()).week());
  const [month, setMonth] = useState(dayjs(new Date()).format("MMMM"));
  const [year, setYear] = useState(dayjs(new Date()).format("YYYY"));
  const { settings } = useSettingStore();

  const scrollToCurrentDate = useCallback(() => {
    if (gridRef.current) {
      const children = gridRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const date = getDayWithDate(dayjs().startOf("day").toDate());

        if (
          child.id ==
          `${date.day}-${date.date}-${date.month}-${date.year}-${date.week}`
        ) {
          let reduce = 0;
          if (settings.view === 7) {
            reduce = calculateDaysToPreviousMonday(date.day);
          }
          gridRef.current.scrollTo(
            gridRef.current.children[i].clientWidth * (i + reduce),
            0,
          );
        }
      }
    }
  }, [settings.view]);

  const setCurrentMonth = useCallback(() => {
    if (gridRef.current) {
      const children = gridRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const rect = child.getBoundingClientRect();

        if (rect.x > 0) {
          setMonth(child.id.split("-")[2]);
          setYear(child.id.split("-")[3]);
          setWeek(Number(child.id.split("-")[4]));

          break;
        }
      }
    }
  }, []);

  return (
    <main className="flex w-full flex-col items-center justify-between bg-background">
      <Header
        scrollToCurrentDate={scrollToCurrentDate}
        month={month}
        year={year}
      />

      {settings.view !== 30 ? (
        <div className={"flex justify-between text-sm w-full"}>
          <div className={"flex flex-col h-full w-20"}>
            <p className="flex items-center justify-center w-full h-12 border-b">
              W{week}
            </p>
            <span className="flex flex-col border-t">
              {new Array(24 * 1).fill(0).map((_, index) => (
                <TimeBlock key={index} hour={index} />
              ))}
            </span>
          </div>
          <Grid
            gridRef={gridRef}
            scrollToCurrentDate={scrollToCurrentDate}
            setCurrentMonth={setCurrentMonth}
          />
        </div>
      ) : (
        <p className="h-[calc(100vh-64px)] flex items-center justify-center font-semibold text-2xl">
          Month view coming soon
        </p>
      )}
    </main>
  );
}
