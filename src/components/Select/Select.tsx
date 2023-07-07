import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material"
import { ReactNode } from "react"

type Item = {
    _id: string,
    slug: string,
    [key: string]: string|Record<string,string>[]|string[]
}

type Props = {
    items: Item[],
    selectedItem: Item,
    name: string
    onChange: (event: SelectChangeEvent<string>, child: ReactNode) => void
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const CustomSelect = (props: Props) => {
    const { items, selectedItem, name, onChange} = props
    return (
        <FormControl style={{minWidth: 100}}>
        <InputLabel id={`select-${name}-label`}>{name}</InputLabel>
        <Select
          labelId={`select-${name}-label`}
          value={selectedItem._id}
          label={name}
          onChange={onChange}
          MenuProps={MenuProps}
        >
          {
            items.map(item => {
              return (
                <MenuItem key={item._id} value={item._id}>{item.slug}</MenuItem>
              )
            })
          }
        </Select>
      </FormControl>
    )
}