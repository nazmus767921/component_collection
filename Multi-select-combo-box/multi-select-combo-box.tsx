'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { FormField, FormItem, FormLabel } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { IconCheck, IconSelector, IconX } from '@tabler/icons-react'
import {
  FieldPath,
  FieldValues,
  PathValue,
  UseFormReturn,
} from 'react-hook-form'
import React from 'react'

type Option = {
  label: string
  value: string
}

type GenericComboboxProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  name: FieldPath<T>
  options: Option[]
  label?: string
  disabled?: boolean
  placeholder?: string
  multiselect?: boolean
  onSelect?: (option: Option | Option[]) => void
  renderOption?: (option: Option, selected: boolean) => React.ReactNode
  renderSelected?: (
    selected: Option | Option[] | null,
    handleRemove?: (value: string, e: React.MouseEvent) => void
  ) => React.ReactNode
}

export function MultiSelectCombobox<T extends FieldValues>({
  form,
  name,
  options,
  label = 'Select',
  disabled = false,
  placeholder = 'Select option...',
  multiselect = false,
  onSelect,
  renderOption,
  renderSelected,
}: GenericComboboxProps<T>) {
  const { control, getFieldState, setValue } = form

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiselect) {
      const currentValues = (form.getValues(name) as string[]) || []
      const newValues = currentValues.filter(v => v !== value)
      setValue(name, newValues as PathValue<T, FieldPath<T>>, {
        shouldValidate: true,
      })
      onSelect?.(options.filter(opt => newValues.includes(opt.value)))
    }
  }

  const DefaultRemovableItem = ({ option }: { option: Option }) => (
    <span className='flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm'>
      {option.label}
      <span
        onClick={e => handleRemove(option.value, e)}
        className='ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5'
        aria-label={`Remove ${option.label}`}
      >
        <IconX className='h-3 w-3 opacity-70 hover:opacity-100' />
      </span>
    </span>
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValues = multiselect
          ? (field.value as string[]) || []
          : [field.value as string].filter(Boolean)

        const selectedOptions = options.filter(opt =>
          multiselect
            ? selectedValues.includes(opt.value)
            : opt.value === field.value
        )

        const handleSelect = (option: Option) => {
          if (multiselect) {
            const newValues = selectedValues.includes(option.value)
              ? selectedValues.filter(v => v !== option.value)
              : [...selectedValues, option.value]

            setValue(name, newValues as PathValue<T, FieldPath<T>>, {
              shouldValidate: true,
            })
            onSelect?.(options.filter(opt => newValues.includes(opt.value)))
          } else {
            setValue(name, option.value as PathValue<T, FieldPath<T>>, {
              shouldValidate: true,
            })
            onSelect?.(option)
          }
        }

        return (
          <FormItem>
            {label && <FormLabel className='text-xs'>{label}</FormLabel>}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  disabled={disabled}
                  className={cn(
                    'w-full justify-between h-fit min-h-10',
                    getFieldState(name).error &&
                      'border-destructive text-destructive ring-1 ring-destructive'
                  )}
                >
                  {renderSelected ? (
                    renderSelected(
                      multiselect
                        ? selectedOptions
                        : selectedOptions[0] || null,
                      handleRemove
                    )
                  ) : (
                    <div className='flex flex-wrap gap-1.5 overflow-hidden'>
                      {multiselect ? (
                        selectedOptions.length > 0 ? (
                          selectedOptions.map(option => (
                            <DefaultRemovableItem
                              key={option.value}
                              option={option}
                            />
                          ))
                        ) : (
                          <span className='text-muted-foreground'>
                            {placeholder}
                          </span>
                        )
                      ) : (
                        <span className='text-muted-foreground'>
                          {selectedOptions[0]
                            ? selectedOptions[0].label
                            : placeholder}
                        </span>
                      )}
                    </div>
                  )}
                  <IconSelector className='h-4 w-4 opacity-50' />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className='p-0 w-full'
                align='start'
              >
                <Command>
                  <CommandInput
                    placeholder='Search...'
                    className='h-9'
                  />
                  <CommandList>
                    <CommandEmpty>No options found.</CommandEmpty>
                    <CommandGroup>
                      {options.map(option => {
                        const isSelected = multiselect
                          ? selectedValues.includes(option.value)
                          : field.value === option.value

                        return (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => handleSelect(option)}
                          >
                            {renderOption ? (
                              renderOption(option, isSelected)
                            ) : (
                              <div className='flex items-center justify-between w-full'>
                                <span>{option.label}</span>
                                {isSelected && (
                                  <IconCheck className='ml-auto h-4 w-4' />
                                )}
                              </div>
                            )}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>
        )
      }}
    />
  )
}
