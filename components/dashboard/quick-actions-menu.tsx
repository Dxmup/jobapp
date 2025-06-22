import { Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react"
import { HamburgerIcon } from "@chakra-ui/icons"

const QuickActionsMenu = () => {
  return (
    <Menu>
      <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="outline" />
      <MenuList>
        <MenuItem>Option 1</MenuItem>
        <MenuItem>Option 2</MenuItem>
        <MenuItem>Option 3</MenuItem>
      </MenuList>
    </Menu>
  )
}

export default QuickActionsMenu
