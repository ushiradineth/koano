"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/molecules/Dialog";
import { z } from "zod";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

import {
	convertISOToTime,
	getDateFromEventTimer,
	isStartBeforeEnd,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/molecules/Form";
import { editEventSchema } from "@/lib/validators";
import { useEffect } from "react";
import { toast } from "sonner";

import DatePicker from "@/components/molecules/DatePicker";
import Picker from "@/components/molecules/Picker";
import { useDataContext, useEventContext } from "@/components/utils/Context";

export default function Edit({
	params: pageParams,
}: {
	params: { eventId: string };
}) {
	const router = useRouter();
	const eventContext = useEventContext();
	const dataContext = useDataContext();
	const params = useSearchParams();

	const form = useForm<z.infer<typeof editEventSchema>>({
		resolver: zodResolver(editEventSchema),
		defaultValues: {
			id: "",
			title: "",
			start: convertISOToTime(new Date().toISOString()),
			end: convertISOToTime(new Date().toISOString()),
			timezone: dataContext.timezone,
			repeat: dataContext.repeated[0],
			date: new Date(new Date().toISOString()),
		},
	});

	function onSubmit(values: z.infer<typeof editEventSchema>) {
		if (!isStartBeforeEnd(values.start.value, values.end.value)) {
			toast("Start and End is invalid.");
			return;
		}

		const events = eventContext.events;

		for (const event of events) {
			if (event.id === values.id) {
				event.title = values.title;
				event.start = values.start.value;
				event.end = values.end.value;
				event.repeated = values.repeat;
				event.timezone = values.timezone;
				event.date = values.date;

				break;
			}
		}

		eventContext.setEvents(events);

		toast("Event has been edited.");
		router.back();
	}

	useEffect(() => {
		const event = eventContext.events.find(
			(event) => event.id === pageParams.eventId,
		);

		if (!event) {
			redirect("/");
		}

		form.setValue("id", event.id);
		form.setValue(
			"start",
			convertISOToTime(
				getDateFromEventTimer(event.date, event.start).toISOString(),
			),
		);
		form.setValue(
			"end",
			convertISOToTime(
				getDateFromEventTimer(event.date, event.end).toISOString(),
			),
		);
		form.setValue("title", event.title);
		form.setValue("repeat", event.repeated);
		form.setValue("date", new Date(event.date));
		form.setValue("timezone", event.timezone);
	}, [eventContext.events, form, pageParams.eventId, params]);

	return (
		<Dialog onOpenChange={() => router.back()} open={true}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Event</DialogTitle>
					<DialogDescription>Edit existing event</DialogDescription>
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
								options={dataContext.times}
							/>

							<Picker
								name={"end"}
								label={"End"}
								form={form}
								options={dataContext.times}
							/>
						</span>

						<DatePicker name={"date"} label={"Date"} form={form} />

						<Picker
							name={"timezone"}
							label={"Timezone"}
							form={form}
							options={dataContext.timezones}
						/>

						<Picker
							name={"repeat"}
							label={"Repeat"}
							form={form}
							options={dataContext.repeated}
						/>

						<DialogFooter className="flex flex-col gap-2 md:gap-0">
							<Button type="submit">Save</Button>
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
