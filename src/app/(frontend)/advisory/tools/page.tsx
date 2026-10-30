import { redirect } from "next/navigation";

// The tools are listed on /advisory; /advisory/tools has no page of its own.
export default function ToolsIndex() {
  redirect("/advisory#tools");
}
