import { Item } from "@/components/Dropdown";

export type Model = Item | Item & {
  version: string;
  source_ref: string;
}
