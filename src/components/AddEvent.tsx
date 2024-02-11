"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { queryParams } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

export default function AddEvent({ open, setOpen }: Props) {
	const router = useRouter();
	const params = useSearchParams();
	const pathname = usePathname();

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				if (!value) {
					const url = queryParams(
						["start", "end"],
						[["clear", "true"]],
						params.entries(),
						pathname,
					);

					router.replace(url);
				}

				setOpen(value);
			}}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Event</DialogTitle>
					<DialogDescription>Add new event</DialogDescription>
				</DialogHeader>
				<div className="flex items-center space-x-2">
					<div className="grid flex-1 gap-2">
						<Label htmlFor="title" className="sr-only">
							Title
						</Label>
						<Input id="title" maxLength={200} min={1} />
					</div>
				</div>
				<DialogFooter>
					<Button type="submit" size="sm" className="px-3">
						Create
					</Button>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
