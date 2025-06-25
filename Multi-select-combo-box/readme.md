# 📘 Multi Select Combobox

A flexible, reusable combobox component with support for both single and multi-select use cases. Designed to integrate seamlessly with React Hook Form and customized via `renderOption` and `renderSelected` props.

---

## ✅ Features

- ✅ Works with `react-hook-form`
- ✅ Single and multi-select support
- ✅ Optional labels and placeholders
- ✅ Fully customizable rendering for dropdown and selected items
- ✅ Built with `shadcn/ui`, `@tabler/icons-react`, and TailwindCSS
- ✅ Handles item removal and selection logic

---

## 🧩 Props

```ts
type GenericComboboxProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  name: FieldPath<T>
  options: { label: string; value: string }[]
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
```

---

## 🚀 Usage

### Single Select

```tsx
<MultiSelectCombobox
  form={form}
  name="category"
  label="Category"
  options={[
    { label: 'Tech', value: 'tech' },
    { label: 'Fashion', value: 'fashion' }
  ]}
/>
```

---

### Multi Select

```tsx
<MultiSelectCombobox
  form={form}
  name="tags"
  label="Tags"
  multiselect
  options={[
    { label: 'Popular', value: 'popular' },
    { label: 'Trending', value: 'trending' },
    { label: 'New', value: 'new' }
  ]}
/>
```

---

### Custom Option Rendering

```tsx
renderOption={(option, selected) => (
  <div className="flex items-center gap-2">
    <span className="capitalize">{option.label}</span>
    {selected && <IconCheck className="ml-auto h-4 w-4" />}
  </div>
)}
```

---

### Custom Selected Rendering

```tsx
renderSelected={(selected, remove) => (
  <div className="flex gap-2 flex-wrap">
    {(Array.isArray(selected) ? selected : [selected])
      .filter(Boolean)
      .map(option => (
        <span key={option?.value} className="px-2 py-1 bg-muted rounded">
          {option?.label}
          <button onClick={(e) => remove?.(option.value, e)}>❌</button>
        </span>
      ))}
  </div>
)}
```

---

## 🧪 RHF Integration

```ts
const schema = z.object({
  category: z.string(),
  tags: z.array(z.string())
})

const form = useForm<z.infer<typeof schema>>({
  defaultValues: {
    category: '',
    tags: []
  }
})
```

---

## 🧠 Notes

- Always ensure `name` matches your form shape, especially when used inside `useFieldArray`
- `renderSelected` passes `handleRemove` only in multiselect mode
- `onSelect` receives:
  - a single `Option` for single-select
  - an array of `Option[]` for multi-select

---

