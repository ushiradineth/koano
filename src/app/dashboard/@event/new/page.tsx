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
	getUserTimezone,
	isStartBeforeEnd,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/molecules/Form";
import { addEventSchema } from "@/lib/validators";
import { useEffect } from "react";
import { toast } from "sonner";

import DatePicker from "@/components/molecules/DatePicker";
import Picker from "@/components/molecules/Picker";
import { useDataContext, useEventContext } from "@/components/utils/Context";

export default function New() {
	const router = useRouter();
	const eventContext = useEventContext();
	const dataContext = useDataContext();
	const params = useSearchParams();

	const form = useForm<z.infer<typeof addEventSchema>>({
		resolver: zodResolver(addEventSchema),
		defaultValues: {
			title: "",
			start: convertISOToTime(params.get("start") ?? new Date().toISOString()),
			end: convertISOToTime(params.get("end") ?? new Date().toISOString()),
			timezone: dataContext.timezone,
			repeat: dataContext.repeated[0],
			date: new Date(params.get("start") ?? new Date().toISOString()),
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
		router.back();
	}

	useEffect(() => {
		params.get("start") &&
			form.setValue(
				"start",
				convertISOToTime(params.get("start") ?? new Date().toISOString()),
			);
		params.get("end") &&
			form.setValue(
				"end",
				convertISOToTime(params.get("end") ?? new Date().toISOString()),
			);

		form.setValue("title", "");
		form.setValue("repeat", dataContext.repeated[0]);
		form.setValue(
			"date",
			new Date(params.get("start") ?? new Date().toISOString()),
		);
		form.setValue(
			"timezone",
			getUserTimezone(dataContext.timezones) ?? dataContext.timezones[0],
		);
	}, [dataContext.repeated, dataContext.timezones, form, params]);

	return (
		<Dialog onOpenChange={() => router.back()} open={true}>
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
