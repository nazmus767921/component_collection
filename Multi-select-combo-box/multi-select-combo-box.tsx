'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
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
  useWatch,
} from 'react-hook-form'

type Option = {
  label: string
  value: string
}

type CommonProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  name: FieldPath<T>
  options: Option[]
  label?: string
  disabled?: boolean
  placeholder?: string
  renderOption?: (option: Option, selected: boolean) => React.ReactNode
  listHeight?: number
}

type MultiSelectProps = {
  multiselect: true
  onSelect?: (selected: Option[]) => void
  renderSelected?: (
    selected: Option[],
    handleRemove: (value: string, e: React.MouseEvent) => void
  ) => React.ReactNode
}

type SingleSelectProps = {
  multiselect?: false
  onSelect?: (selected: Option) => void
  renderSelected?: (selected: Option | null) => React.ReactNode
}

export type GenericComboboxProps<T extends FieldValues> = CommonProps<T> &
  (MultiSelectProps | SingleSelectProps)

export function MultiSelectCombobox<T extends FieldValues>({
  form,
  name,
  options,
  label = 'Select',
  disabled = false,
  placeholder = 'Select option...',
  renderOption,
  listHeight = 300, // customizable list height
  ...props
}: GenericComboboxProps<T>) {
  const { control, getFieldState, setValue, getValues } = form
  const [inputValue, setInputValue] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedValues = props.multiselect
    ? (getValues(name) as string[]) || []
    : [getValues(name) as string].filter(Boolean)

  const watchedValue = useWatch({ control, name })

  const selectedOptions = useMemo(() => {
    if (props.multiselect) {
      const values = Array.isArray(watchedValue)
        ? watchedValue
        : ([] as string[])
      return options.filter(opt => values.includes(opt.value))
    }

    return options.filter(opt => opt.value === watchedValue)
  }, [watchedValue, options, props.multiselect])

  const filteredOptions = useMemo(() => {
    const search = inputValue.toLowerCase()
    return options.filter(
      o =>
        o.label.toLowerCase().includes(search) ||
        o.value.toLowerCase().includes(search)
    )
  }, [options, inputValue])

  const handleSelect = useCallback(
    (option: Option) => {
      if (props.multiselect) {
        const newValues = selectedValues.includes(option.value)
          ? selectedValues.filter(v => v !== option.value)
          : [...selectedValues, option.value]

        setValue(name, newValues as PathValue<T, FieldPath<T>>, {
          shouldValidate: true,
        })

        props.onSelect?.(options.filter(opt => newValues.includes(opt.value)))
      } else {
        setValue(name, option.value as PathValue<T, FieldPath<T>>, {
          shouldValidate: true,
        })
        props.onSelect?.(option)
      }
    },
    [selectedValues, setValue, name, options, props]
  )

  const handleRemove = useCallback(
    (value: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (props.multiselect) {
        const currentValues = (getValues(name) as string[]) || []
        const newValues = currentValues.filter(v => v !== value)
        setValue(name, newValues as PathValue<T, FieldPath<T>>, {
          shouldValidate: true,
        })
        props.onSelect?.(options.filter(opt => newValues.includes(opt.value)))
      }
    },
    [getValues, setValue, name, options, props]
  )

  const DefaultRemovableItem = ({ option }: { option: Option }) => (
    <span className='bg-muted flex items-center gap-1 rounded px-2 py-1 text-sm'>
      {option.label}
      <span
        onClick={e => handleRemove(option.value, e)}
        className='hover:bg-muted-foreground/20 ml-1 rounded-full p-0.5'
        aria-label={`Remove ${option.label}`}
      >
        <IconX className='h-3 w-3 opacity-70 hover:opacity-100' />
      </span>
    </span>
  )

  const ITEM_HEIGHT = 40
  const INPUT_HEIGHT = 36
  const VIRTUAL_LIST_HEIGHT = listHeight - INPUT_HEIGHT

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          {label && <FormLabel className='text-xs'>{label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                disabled={disabled}
                className={cn(
                  'h-fit min-h-10 w-full justify-between',
                  getFieldState(name).error &&
                    'border-destructive text-destructive ring-destructive ring-1'
                )}
              >
                {'renderSelected' in props && props.renderSelected ? (
                  props.multiselect ? (
                    props.renderSelected(selectedOptions, handleRemove)
                  ) : (
                    props.renderSelected(selectedOptions[0] || null)
                  )
                ) : (
                  <div className='flex flex-wrap gap-1.5 overflow-hidden'>
                    {props.multiselect ? (
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
                    ) : selectedOptions[0] ? (
                      <span className='text-foreground'>
                        {selectedOptions[0].label}
                      </span>
                    ) : (
                      <span className='text-muted-foreground'>
                        {placeholder}
                      </span>
                    )}
                  </div>
                )}
                <IconSelector className='h-4 w-4 opacity-50' />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className='w-full p-0'
              align='start'
              style={{ height: listHeight }}
            >
              <Command
                shouldFilter={false}
                className='flex h-full flex-col'
              >
                <CommandInput
                  placeholder='Search...'
                  className='h-9'
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList className='flex-1 overflow-hidden'>
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandGroup className='!p-0'>
                    <List
                      height={Math.min(
                        filteredOptions.length * ITEM_HEIGHT,
                        VIRTUAL_LIST_HEIGHT
                      )}
                      itemCount={filteredOptions.length}
                      itemSize={ITEM_HEIGHT}
                      width='16rem'
                      className='!overflow-x-hidden'
                    >
                      {({ index, style }) => {
                        const option = filteredOptions[index]
                        const isSelected = props.multiselect
                          ? selectedValues.includes(option.value)
                          : getValues(name) === option.value

                        return (
                          <div
                            style={style}
                            key={option.value}
                            className='p-2'
                          >
                            <CommandItem
                              value={`${option.label} ${option.value}`}
                              onSelect={() => handleSelect(option)}
                            >
                              {renderOption ? (
                                renderOption(option, isSelected)
                              ) : (
                                <div className='flex w-full items-center justify-between'>
                                  <span>{option.label}</span>
                                  {isSelected && (
                                    <IconCheck className='ml-auto h-4 w-4' />
                                  )}
                                </div>
                              )}
                            </CommandItem>
                          </div>
                        )
                      }}
                    </List>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  )
}
