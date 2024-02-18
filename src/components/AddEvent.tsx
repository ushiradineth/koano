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
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
	convertISOToTime,
	generateTimeArray,
	isStartBeforeEnd,
	queryParams,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { addEventSchema } from "@/lib/validators";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { repeatValues } from "@/lib/consts";
import Picker from "./Picker";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

export default function AddEvent({ open, setOpen }: Props) {
	const router = useRouter();
	const params = useSearchParams();
	const pathname = usePathname();

	const times = useMemo(() => generateTimeArray(), []);

	const form = useForm<z.infer<typeof addEventSchema>>({
		resolver: zodResolver(addEventSchema),
		defaultValues: {
			title: "",
			start: convertISOToTime(params.get("start") ?? ""),
			end: convertISOToTime(params.get("end") ?? ""),
			repeat: repeatValues[0],
		},
	});

	function onSubmit(values: z.infer<typeof addEventSchema>) {
		if (!isStartBeforeEnd(values.start.value, values.end.value)) {
			toast("Start and End is invalid.");
			return;
		}

		toast("Event has been created.");
		setOpen(!open);
	}

	useEffect(() => {
		params.get("start") &&
			form.setValue("start", convertISOToTime(params.get("start")!));
		params.get("end") &&
			form.setValue("end", convertISOToTime(params.get("end")!));

		form.setValue("title", "");
		form.setValue("repeat", repeatValues[0]);
	}, [form, params, pathname]);

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

					router.replace(url, { scroll: false });
				}

				setOpen(value);
			}}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Event</DialogTitle>
					<DialogDescription>Add new event</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Work on a cool project" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<span className="flex items-center justify-between gap-2">
							<Picker
								name={"start"}
								label={"Start"}
								form={form}
								options={times}
							/>

							<Picker name={"end"} label={"End"} form={form} options={times} />
						</span>

						<Picker
							name={"repeat"}
							label={"Repeat"}
							form={form}
							options={repeatValues}
						/>

						<DialogFooter className="flex flex-col gap-2 md:gap-0">
							<Button type="submit">Create</Button>
							<DialogClose asChild>
								<Button type="button" variant="secondary">
									Close
								</Button>
							</DialogClose>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
