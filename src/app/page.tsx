import { Suspense } from "react";
import EventList from "./event-list";

export default function Home() {
  return (
    <Suspense>
      <EventList />
    </Suspense>
  );
}
