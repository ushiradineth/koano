"use client";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/atoms/Button";

import { cn } from "@/lib/utils";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/molecules/Form";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/molecules/Command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/molecules/Popover";
import { PickerType } from "@/lib/types";

interface Props {
	name: string;
	label: string;
	form: any;
	options: PickerType[];
}

export default function Picker({ name, label, form, options }: Props) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem className="flex flex-col w-full">
					<FormLabel>{label}</FormLabel>
					<Popover>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant="outline"
									role="combobox"
									className={cn(
										"justify-between",
										!field.value && "text-muted-foreground",
									)}>
									{field.value
										? options.find(
												(option) => option.value === field.value.value,
											)?.label
										: "Select option"}
									<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandInput placeholder="Search option..." className="h-9" />
								<CommandEmpty>No option found.</CommandEmpty>
								<CommandGroup className="max-h-40">
									{options.map((option) => (
										<CommandItem
											value={option.label}
											key={option.value}
											onSelect={() => {
												form.setValue(field.name, option);
											}}>
											{option.label}
											<CheckIcon
												className={cn(
													"ml-auto h-4 w-4",
													option.value === field.value.value
														? "opacity-100"
														: "opacity-0",
												)}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							</Command>
						</PopoverContent>
					</Popover>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
