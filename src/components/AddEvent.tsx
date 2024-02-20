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
	getUserTimezone,
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
import { useEffect } from "react";
import { toast } from "sonner";

import { useDataContext, useEventContext } from "@/components/Context";
import DatePicker from "./DatePicker";
import Picker from "./Picker";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

export default function AddEvent({ open, setOpen }: Props) {
	const router = useRouter();
	const params = useSearchParams();
	const pathname = usePathname();
	const eventContext = useEventContext();
	const dataContext = useDataContext();

	const form = useForm<z.infer<typeof addEventSchema>>({
		resolver: zodResolver(addEventSchema),
		defaultValues: {
			title: "",
			start: convertISOToTime(params.get("start") ?? ""),
			end: convertISOToTime(params.get("end") ?? ""),
			timezone:
				getUserTimezone(dataContext.timezone) ?? dataContext.timezone[0],
			repeat: dataContext.repeated[0],
			date: new Date(),
		},
	});

	function onSubmit(values: z.infer<typeof addEventSchema>) {
		if (!isStartBeforeEnd(values.start.value, values.end.value)) {
			toast("Start and End is invalid.");
			return;
		}

		eventContext.setEvents([
			...eventContext.events,
			{
				title: values.title,
				start: values.start.value,
				end: values.end.value,
				repeated: values.repeat,
				timezone: values.timezone,
				date: values.date,
			},
		]);

		toast("Event has been created.");
		setOpen(!open);
	}

	useEffect(() => {
		if (open) {
			params.get("start") &&
				form.setValue("start", convertISOToTime(params.get("start")!));
			params.get("end") &&
				form.setValue("end", convertISOToTime(params.get("end")!));

			form.setValue("title", "");
			form.setValue("repeat", dataContext.repeated[0]);
			form.setValue("date", new Date());
			form.setValue(
				"timezone",
				getUserTimezone(dataContext.timezone) ?? dataContext.timezone[0],
			);
		}
	}, [
		form,
		params,
		pathname,
		open,
		dataContext.timezone,
		dataContext.repeated,
	]);

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
								options={dataContext.time}
							/>

							<Picker
								name={"end"}
								label={"End"}
								form={form}
								options={dataContext.time}
							/>
						</span>

						<DatePicker name={"date"} label={"Date"} form={form} />

						<Picker
							name={"timezone"}
							label={"Timezone"}
							form={form}
							options={dataContext.timezone}
						/>

						<Picker
							name={"repeat"}
							label={"Repeat"}
							form={form}
							options={dataContext.repeated}
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
