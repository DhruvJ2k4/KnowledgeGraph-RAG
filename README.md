# Function Descriptions

## frontend/src/App.tsx
- `ProtectedRoute`: This is a component that checks for an authentication token in local storage. If the token is not present, it redirects the user to the login page. Otherwise, it renders its children.
- `App`: This is the main application component. It sets up the React Router, defines the routes for the application (login, register, index, and a 404 page), and includes a Toaster component for displaying notifications.

## frontend/src/components/ChatInterface.tsx
- `ChatInterface`: This component provides an interactive chat interface for querying the knowledge graph. It includes a header with the component title, KG status, clear history and logout buttons, a chat area displaying messages, and an input area for sending new messages. It uses the `useChat` and `useKnowledgeGraph` hooks to manage chat messages and knowledge graph status.
- `handleSubmit`: This function handles the form submission when the user sends a message. It prevents the default form submission behavior, checks if the input is not empty, the knowledge graph is ready, and the chat is not loading, then sends the message using the `sendMessage` function from the `useChat` hook and clears the input.
- `formatTime`: This function formats a date object to display the time in a 2-digit hour and minute format.
- `TypingIndicator`: This component displays a typing indicator with animated dots and a "Retrieving Knowledge..." message.
- `handleLogout`: This asynchronous function handles the logout process. It calls the `authApi.logout()` function to log the user out, displays a success or error toast message, and navigates the user to the login page.

## frontend/src/components/FileList.tsx
- `FileList`: This component displays a list of uploaded files with their status and progress. It uses the `usePDFUpload` hook to access the files and deleteFile function. If there are no files uploaded, it displays a message indicating that.
- `formatFileSize`: This function takes a file size in bytes and formats it into a human-readable string with appropriate units (Bytes, KB, MB, GB).
- `getStatusBadge`: This function takes a status string and returns a badge component with the corresponding label and styling. The badges are used to indicate the status of each file (e.g., Pending, Uploading, Uploaded, Processed, Error).

## frontend/src/components/GraphVisualization.tsx
- `GraphVisualization`: This component displays the knowledge graph in a visual format. It uses the `useKnowledgeGraph` hook to check if the knowledge graph is ready. It fetches graph data from an API endpoint and renders the graph using SVG. It also displays a loading indicator, an error message, and a legend.
- `loadGraphData`: This asynchronous function loads the graph visualization data from the `/api/knowledge-graph/visualization` endpoint. It sets the `isLoading` state to true while loading, and handles potential errors. It also includes a mock graph data for demonstration purposes.
- `renderGraph`: This function renders the graph using SVG. It positions the nodes in a circle and draws lines between them to represent relationships. It also includes a legend to explain the different node types.

## frontend/src/components/KnowledgeGraphStatus.tsx
- `KnowledgeGraphStatus`: This component displays the current status of the knowledge graph and provides build/delete controls. It uses the `useKnowledgeGraph` and `usePDFUpload` hooks to access the status, building state, and file information. It displays different UI elements based on the status of the knowledge graph, such as offline, processing, building, ready, or error.
- `getStatusIndicator`: This function returns a status indicator component based on the current status of the knowledge graph. The indicator includes a colored dot and a text label.
- `getProcessStatusCard`: This function returns a card component that displays statistics about the knowledge graph building process, such as the number of PDFs processed, chunks created, entities extracted, and relationships created.

## frontend/src/components/PDFUploadArea.tsx
- `PDFUploadArea`: This component provides a drag-and-drop area and file selection functionality for uploading PDF files. It uses the `usePDFUpload` hook to manage the files and upload process. It displays a drop zone, a file input, and an upload button.
- `handleDrop`: This function handles the file drop event. It prevents the default behavior, sets the `isDragOver` state to false, and adds the dropped files to the file list using the `addFiles` function from the `usePDFUpload` hook.
- `handleDragOver`: This function handles the drag over event. It prevents the default behavior and sets the `isDragOver` state to true.
- `handleDragLeave`: This function handles the drag leave event. It prevents the default behavior and sets the `isDragOver` state to false.
- `handleFileSelect`: This function handles the file input change event. It gets the selected files from the input, adds them to the file list using the `addFiles` function from the `usePDFUpload` hook, and resets the input value to allow selecting the same file again.

## frontend/src/components/common/Header.tsx
- `Header`: This component renders the header of the application. It displays the application title "Knowledge Graph - RAG" and a subtitle "AI-Powered Document Analysis & Question Answering".

## frontend/src/components/ui/accordion.tsx
- `Accordion`: This is an accordion component built using Radix UI primitives. It acts as the root component for the accordion.
- `AccordionItem`: This component represents a single item within the accordion. It wraps the trigger and content.
- `AccordionTrigger`: This component is the clickable trigger that expands or collapses the accordion content.
- `AccordionContent`: This component wraps the content that is displayed when the accordion is expanded.

## frontend/src/components/ui/alert-dialog.tsx
- `AlertDialog`: This is an alert dialog component built using Radix UI primitives. It acts as the root component for the alert dialog.
- `AlertDialogTrigger`: This component is the button that opens the alert dialog.
- `AlertDialogPortal`: This component portals the alert dialog content to the root of the document body.
- `AlertDialogOverlay`: This component is the overlay that covers the entire screen when the alert dialog is open.
- `AlertDialogContent`: This component is the main content of the alert dialog.
- `AlertDialogHeader`: This component is the header of the alert dialog, typically containing the title and description.
- `AlertDialogFooter`: This component is the footer of the alert dialog, typically containing the action and cancel buttons.
- `AlertDialogTitle`: This component is the title of the alert dialog.
- `AlertDialogDescription`: This component is the description of the alert dialog.
- `AlertDialogAction`: This component is the primary action button of the alert dialog.
- `AlertDialogCancel`: This component is the cancel button of the alert dialog.

## frontend/src/components/ui/alert.tsx
- `Alert`: This component is a styled alert box. It uses `class-variance-authority` to manage different variants (e.g., default, destructive).
- `AlertTitle`: This component is the title of the alert.
- `AlertDescription`: This component is the description of the alert.

## frontend/src/components/ui/aspect-ratio.tsx
- `AspectRatio`: This component is a wrapper around Radix UI's aspect ratio component. It maintains a specific aspect ratio for its content.

## frontend/src/components/ui/avatar.tsx
- `Avatar`: This component is a wrapper around Radix UI's avatar component. It displays an image representing a user or entity.
- `AvatarImage`: This component is used to display the image within the avatar.
- `AvatarFallback`: This component is displayed when the image fails to load. It typically shows the user's initials or a generic icon.

## frontend/src/components/ui/badge.tsx
- `badgeVariants`: This is a `class-variance-authority` function that defines the styles for the `Badge` component based on different variants.
- `Badge`: This component is a styled badge. It uses `class-variance-authority` to manage different variants (e.g., default, secondary, destructive, outline).

## frontend/src/components/ui/breadcrumb.tsx
- `Breadcrumb`: This component is the main container for the breadcrumb navigation.
- `BreadcrumbList`: This component is an ordered list that contains the breadcrumb items.
- `BreadcrumbItem`: This component represents a single item in the breadcrumb list.
- `BreadcrumbLink`: This component is a link that navigates to a different page.
- `BreadcrumbPage`: This component represents the current page in the breadcrumb list.
- `BreadcrumbSeparator`: This component is a separator between the breadcrumb items.
- `BreadcrumbEllipsis`: This component is used to indicate that there are more breadcrumb items that are not currently visible.

## frontend/src/components/ui/button.tsx
- `buttonVariants`: This is a `class-variance-authority` function that defines the styles for the `Button` component based on different variants and sizes.
- `Button`: This component is a styled button. It uses `class-variance-authority` to manage different variants (e.g., default, destructive, outline, secondary, ghost, link) and sizes (e.g., default, sm, lg, icon).

## frontend/src/components/ui/calendar.tsx
- `Calendar`: This component is a calendar built using `react-day-picker`. It allows users to select dates and provides various styling options.

## frontend/src/components/ui/card.tsx
- `Card`: This component is a container for displaying information in a card format.
- `CardHeader`: This component is the header of the card, typically containing the title and description.
- `CardTitle`: This component is the title of the card.
- `CardDescription`: This component is the description of the card.
- `CardContent`: This component is the main content of the card.
- `CardFooter`: This component is the footer of the card, typically containing actions or additional information.

## frontend/src/components/ui/carousel.tsx
- `useCarousel`: This hook provides access to the carousel context, which includes the carousel API, scroll functions, and other relevant properties.
- `Carousel`: This component is the main carousel component. It uses the `embla-carousel-react` library to create a carousel. It provides a context for its children to access the carousel API and other properties.
- `CarouselContent`: This component is the content area of the carousel. It contains the carousel items.
- `CarouselItem`: This component represents a single item in the carousel.
- `CarouselPrevious`: This component is a button that scrolls the carousel to the previous item.
- `CarouselNext`: This component is a button that scrolls the carousel to the next item.

## frontend/src/components/ui/chart.tsx
- `useChart`: This hook provides access to the chart context, which includes the chart configuration.
- `ChartContainer`: This component is the main container for the chart. It provides a context for its children to access the chart configuration and styles the chart.
- `ChartStyle`: This component generates the CSS styles for the chart based on the configuration.
- `ChartTooltip`: This component is a wrapper around Recharts' tooltip component.
- `ChartTooltipContent`: This component is the content of the tooltip. It displays the data for each item in the chart.
- `ChartLegend`: This component is a wrapper around Recharts' legend component.
- `ChartLegendContent`: This component is the content of the legend. It displays the labels and icons for each item in the chart.
- `getPayloadConfigFromPayload`: This function extracts the item configuration from a payload.

## frontend/src/components/ui/checkbox.tsx
- `Checkbox`: This component is a styled checkbox built using Radix UI primitives.

## frontend/src/components/ui/collapsible.tsx
- `Collapsible`: This component is a wrapper around Radix UI's collapsible component. It allows users to expand and collapse content.
- `CollapsibleTrigger`: This component is the trigger that expands or collapses the content.
- `CollapsibleContent`: This component is the content that is displayed when the collapsible is expanded.

## frontend/src/components/ui/command.tsx
- `Command`: This component is a styled command palette built using the `cmdk` library.
- `CommandDialog`: This component is a dialog that contains the command palette.
- `CommandInput`: This component is the input field for the command palette.
- `CommandList`: This component is the list of commands in the command palette.
- `CommandEmpty`: This component is displayed when there are no commands in the command palette.
- `CommandGroup`: This component is a group of commands in the command palette.
- `CommandSeparator`: This component is a separator between command groups in the command palette.
- `CommandItem`: This component is a single command in the command palette.
- `CommandShortcut`: This component displays the keyboard shortcut for a command in the command palette.

## frontend/src/components/ui/context-menu.tsx
- `ContextMenu`: This component is the root component for the context menu.
- `ContextMenuTrigger`: This component is the trigger that opens the context menu.
- `ContextMenuGroup`: This component is a group of items in the context menu.
- `ContextMenuPortal`: This component portals the context menu content to the root of the document body.
- `ContextMenuSub`: This component is a submenu in the context menu.
- `ContextMenuRadioGroup`: This component is a radio group in the context menu.
- `ContextMenuSubTrigger`: This component is the trigger that opens a submenu.
- `ContextMenuSubContent`: This component is the content of a submenu.
- `ContextMenuContent`: This component is the content of the context menu.
- `ContextMenuItem`: This component is a single item in the context menu.
- `ContextMenuCheckboxItem`: This component is a checkbox item in the context menu.
- `ContextMenuRadioItem`: This component is a radio item in the context menu.
- `ContextMenuLabel`: This component is a label in the context menu.
- `ContextMenuSeparator`: This component is a separator between items in the context menu.
- `ContextMenuShortcut`: This component displays the keyboard shortcut for a command in the context menu.

## frontend/src/components/ui/dialog.tsx
- `Dialog`: This component is the root component for the dialog.
- `DialogTrigger`: This component is the trigger that opens the dialog.
- `DialogPortal`: This component portals the dialog content to the root of the document body.
- `DialogClose`: This component is the button that closes the dialog.
- `DialogOverlay`: This component is the overlay that covers the entire screen when the dialog is open.
- `DialogContent`: This component is the content of the dialog.
- `DialogHeader`: This component is the header of the dialog, typically containing the title and description.
- `DialogFooter`: This component is the footer of the dialog, typically containing actions or additional information.
- `DialogTitle`: This component is the title of the dialog.
- `DialogDescription`: This component is the description of the dialog.

## frontend/src/components/ui/drawer.tsx
- `Drawer`: This component is the root component for the drawer.
- `DrawerTrigger`: This component is the trigger that opens the drawer.
- `DrawerPortal`: This component portals the drawer content to the root of the document body.
- `DrawerClose`: This component is the button that closes the drawer.
- `DrawerOverlay`: This component is the overlay that covers the entire screen when the drawer is open.
- `DrawerContent`: This component is the content of the drawer.
- `DrawerHeader`: This component is the header of the drawer, typically containing the title and description.
- `DrawerFooter`: This component is the footer of the drawer, typically containing actions or additional information.
- `DrawerTitle`: This component is the title of the drawer.
- `DrawerDescription`: This component is the description of the drawer.

## frontend/src/components/ui/dropdown-menu.tsx
- `DropdownMenu`: This component is the root component for the dropdown menu.
- `DropdownMenuTrigger`: This component is the trigger that opens the dropdown menu.
- `DropdownMenuGroup`: This component is a group of items in the dropdown menu.
- `DropdownMenuPortal`: This component portals the dropdown menu content to the root of the document body.
- `DropdownMenuSub`: This component is a submenu in the dropdown menu.
- `DropdownMenuRadioGroup`: This component is a radio group in the dropdown menu.
- `DropdownMenuSubTrigger`: This component is the trigger that opens a submenu.
- `DropdownMenuSubContent`: This component is the content of a submenu.
- `DropdownMenuContent`: This component is the content of the dropdown menu.
- `DropdownMenuItem`: This component is a single item in the dropdown menu.
- `DropdownMenuCheckboxItem`: This component is a checkbox item in the dropdown menu.
- `DropdownMenuRadioItem`: This component is a radio item in the dropdown menu.
- `DropdownMenuLabel`: This component is a label in the dropdown menu.
- `DropdownMenuSeparator`: This component is a separator between items in the dropdown menu.
- `DropdownMenuShortcut`: This component displays the keyboard shortcut for a command in the dropdown menu.

## frontend/src/components/ui/form.tsx
- `Form`: This component is a wrapper around `react-hook-form`'s `FormProvider`. It provides a form context to its children.
- `FormField`: This component is a wrapper around `react-hook-form`'s `Controller`. It provides a form field context to its children.
- `useFormField`: This hook provides access to the form field context.
- `FormItem`: This component is a container for a form field. It provides a unique ID for the form field and its associated elements.
- `FormLabel`: This component is the label for a form field.
- `FormControl`: This component is a wrapper around a form control. It sets the `id`, `aria-describedby`, and `aria-invalid` attributes for the form control.
- `FormDescription`: This component is the description for a form field.
- `FormMessage`: This component is the error message for a form field.

## frontend/src/components/ui/hover-card.tsx
- `HoverCard`: This component is the root component for the hover card.
- `HoverCardTrigger`: This component is the trigger that opens the hover card.
- `HoverCardContent`: This component is the content of the hover card.

## frontend/src/components/ui/input-otp.tsx
- `InputOTP`: This component is a styled OTP input field.
- `InputOTPGroup`: This component is a group of OTP input slots.
- `InputOTPSlot`: This component is a single slot in the OTP input field.
- `InputOTPSeparator`: This component is a separator between OTP input slots.

## frontend/src/components/ui/input.tsx
- `Input`: This component is a styled input field.

## frontend/src/components/ui/label.tsx
- `labelVariants`: This is a `class-variance-authority` function that defines the styles for the `Label` component.
- `Label`: This component is a styled label.

## frontend/src/components/ui/menubar.tsx
- `MenubarMenu`: This component is a menu in the menubar.
- `MenubarGroup`: This component is a group of items in the menubar.
- `MenubarPortal`: This component portals the menubar content to the root of the document body.
- `MenubarSub`: This component is a submenu in the menubar.
- `MenubarRadioGroup`: This component is a radio group in the menubar.
- `Menubar`: This component is the root component for the menubar.
- `MenubarTrigger`: This component is the trigger that opens a menu in the menubar.
- `MenubarSubTrigger`: This component is the trigger that opens a submenu.
- `MenubarSubContent`: This component is the content of a submenu.
- `MenubarContent`: This component is the content of a menu in the menubar.
- `MenubarItem`: This component is a single item in the menubar.
- `MenubarCheckboxItem`: This component is a checkbox item in the menubar.
- `MenubarRadioItem`: This component is a radio item in the menubar.
- `MenubarLabel`: This component is a label in the menubar.
- `MenubarSeparator`: This component is a separator between items in the menubar.
- `MenubarShortcut`: This component displays the keyboard shortcut for a command in the menubar.

## frontend/src/components/ui/navigation-menu.tsx
- `NavigationMenu`: This component is the root component for the navigation menu.
- `NavigationMenuList`: This component is the list of items in the navigation menu.
- `NavigationMenuItem`: This component is a single item in the navigation menu.
- `navigationMenuTriggerStyle`: This is a `class-variance-authority` function that defines the styles for the `NavigationMenuTrigger` component.
- `NavigationMenuTrigger`: This component is the trigger that opens a content area in the navigation menu.
- `NavigationMenuContent`: This component is the content area that is displayed when a trigger is activated.
- `NavigationMenuLink`: This component is a link in the navigation menu.
- `NavigationMenuViewport`: This component is the viewport for the navigation menu content.
- `NavigationMenuIndicator`: This component is an indicator that highlights the active item in the navigation menu.

## frontend/src/components/ui/pagination.tsx
- `Pagination`: This component is a container for the pagination controls.
- `PaginationContent`: This component is the list of pagination items.
- `PaginationItem`: This component is a single item in the pagination list.
- `PaginationLink`: This component is a link to a specific page.
- `PaginationPrevious`: This component is a link to the previous page.
- `PaginationNext`: This component is a link to the next page.
- `PaginationEllipsis`: This component is used to indicate that there are more pages that are not currently visible.

## frontend/src/components/ui/popover.tsx
- `Popover`: This component is the root component for the popover.
- `PopoverTrigger`: This component is the trigger that opens the popover.
- `PopoverContent`: This component is the content of the popover.

## frontend/src/components/ui/progress.tsx
- `Progress`: This component is a styled progress bar.

## frontend/src/components/ui/radio-group.tsx
- `RadioGroup`: This component is the root component for the radio group.
- `RadioGroupItem`: This component is a single item in the radio group.

## frontend/src/components/ui/resizable.tsx
- `ResizablePanelGroup`: This component is a group of resizable panels.
- `ResizablePanel`: This component is a single resizable panel.
- `ResizableHandle`: This component is the handle that is used to resize the panels.

## frontend/src/components/ui/scroll-area.tsx
- `ScrollArea`: This component is a scrollable area.
- `ScrollBar`: This component is the scrollbar for the scrollable area.

## frontend/src/components/ui/select.tsx
- `Select`: This component is the root component for the select.
- `SelectGroup`: This component is a group of items in the select.
- `SelectValue`: This component displays the selected value.
- `SelectTrigger`: This component is the trigger that opens the select.
- `SelectScrollUpButton`: This component is the button that scrolls the select content up.
- `SelectScrollDownButton`: This component is the button that scrolls the select content down.
- `SelectContent`: This component is the content of the select.
- `SelectLabel`: This component is a label in the select.
- `SelectItem`: This component is a single item in the select.
- `SelectSeparator`: This component is a separator between items in the select.

## frontend/src/components/ui/separator.tsx
- `Separator`: This component is a visual separator between elements.

## frontend/src/components/ui/sheet.tsx
- `Sheet`: This component is the root component for the sheet.
- `SheetTrigger`: This component is the trigger that opens the sheet.
- `SheetClose`: This component is the button that closes the sheet.
- `SheetPortal`: This component portals the sheet content to the root of the document body.
- `SheetOverlay`: This component is the overlay that covers the entire screen when the sheet is open.
- `SheetContent`: This component is the content of the sheet.
- `SheetHeader`: This component is the header of the sheet, typically containing the title and description.
- `SheetFooter`: This component is the footer of the sheet, typically containing actions or additional information.
- `SheetTitle`: This component is the title of the sheet.
- `SheetDescription`: This component is the description of the sheet.

## frontend/src/components/ui/sidebar.tsx
- `useSidebar`: This hook provides access to the sidebar context, which includes the sidebar state, open state, and toggle function.
- `SidebarProvider`: This component provides the sidebar context to its children.
- `Sidebar`: This component is the main sidebar component.
- `SidebarTrigger`: This component is the trigger that opens the sidebar.
- `SidebarRail`: This component is the rail that is used to toggle the sidebar.
- `SidebarInset`: This component is the inset area for the main content.
- `SidebarInput`: This component is an input field in the sidebar.
- `SidebarHeader`: This component is the header of the sidebar.
- `SidebarFooter`: This component is the footer of the sidebar.
- `SidebarSeparator`: This component is a separator in the sidebar.
- `SidebarContent`: This component is the content area of the sidebar.
- `SidebarGroup`: This component is a group of items in the sidebar.
- `SidebarGroupLabel`: This component is the label for a group of items in the sidebar.
- `SidebarGroupAction`: This component is an action button for a group of items in the sidebar.
- `SidebarGroupContent`: This component is the content area for a group of items in the sidebar.
- `SidebarMenu`: This component is a menu in the sidebar.
- `SidebarMenuItem`: This component is a single item in the sidebar menu.
- `SidebarMenuButton`: This component is a button in the sidebar menu.
- `SidebarMenuAction`: This component is an action button for a menu item in the sidebar.
- `SidebarMenuBadge`: This component is a badge for a menu item in the sidebar.
- `SidebarMenuSkeleton`: This component is a skeleton loader for a menu item in the sidebar.
- `SidebarMenuSub`: This component is a submenu in the sidebar menu.
- `SidebarMenuSubButton`: This component is a button in the sidebar submenu.
- `SidebarMenuSubItem`: This component is a single item in the sidebar submenu.

## frontend/src/components/ui/skeleton.tsx
- `Skeleton`: This component is a skeleton loader.

## frontend/src/components/ui/slider.tsx
- `Slider`: This component is a styled slider.

## frontend/src/components/ui/sonner.tsx
- `Toaster`: This component is a toast notification component using the `sonner` library.

## frontend/src/components/ui/switch.tsx
- `Switch`: This component is a styled switch.

## frontend/src/components/ui/table.tsx
- `Table`: This component is a styled table.
- `TableHeader`: This component is the header of the table.
- `TableBody`: This component is the body of the table.
- `TableFooter`: This component is the footer of the table.
- `TableHead`: This component is a header cell in the table.
- `TableRow`: This component is a row in the table.
- `TableCell`: This component is a cell in the table.
- `TableCaption`: This component is the caption for the table.

## frontend/src/components/ui/tabs.tsx
- `Tabs`: This component is the root component for the tabs.
- `TabsList`: This component is the list of tabs.
- `TabsTrigger`: This component is the trigger for a tab.
- `TabsContent`: This component is the content for a tab.

## frontend/src/components/ui/textarea.tsx
- `Textarea`: This component is a styled textarea.

## frontend/src/components/ui/toast.tsx
- `ToastProvider`: This component provides the context for the toast.
- `ToastViewport`: This component is the viewport for the toasts.
- `toastVariants`: This is a `class-variance-authority` function that defines the styles for the `Toast` component.
- `Toast`: This component is a toast notification.
- `ToastAction`: This component is an action button in the toast.
- `ToastClose`: This component is the close button in the toast.
- `ToastTitle`: This component is the title of the toast.
- `ToastDescription`: This component is the description of the toast.

## frontend/src/components/ui/toaster.tsx
- `Toaster`: This component renders the toast notifications using the `useToast` hook and the `Toast` component.

## frontend/src/components/ui/toggle-group.tsx
- `ToggleGroupContext`: This is a React context that provides the variant and size for the toggle group.
- `ToggleGroup`: This component is the root component for the toggle group.
- `ToggleGroupItem`: This component is a single item in the toggle group.

## frontend/src/components/ui/toggle.tsx
- `toggleVariants`: This is a `class-variance-authority` function that defines the styles for the `Toggle` component.
- `Toggle`: This component is a styled toggle.

## frontend/src/components/ui/tooltip.tsx
- `Tooltip`: This component is the root component for the tooltip.
- `TooltipTrigger`: This component is the trigger that opens the tooltip.
- `TooltipContent`: This component is the content of the tooltip.

## frontend/src/hooks/use-mobile.tsx
- `useIsMobile`: This hook returns a boolean value indicating whether the current screen size is considered mobile.

## frontend/src/hooks/use-toast.ts
- `genId`: This function generates a unique ID for each toast.
- `reducer`: This function is a reducer that manages the state of the toasts.
- `addToRemoveQueue`: This function adds a toast to the remove queue.
- `toast`: This function creates and displays a toast notification.
- `useToast`: This hook provides access to the toast state and functions.

## frontend/src/lib/api.ts
- `authApi.login`: This function sends a login request to the API.
- `authApi.register`: This function sends a register request to the API.
- `authApi.refresh`: This function sends a refresh token request to the API.
- `authApi.logout`: This function sends a logout request to the API.
- `fileApi.upload`: This function sends a file upload request to the API.
- `fileApi.list`: This function retrieves the list of uploaded files from the API.
- `fileApi.delete`: This function sends a delete file request to the API.
- `fileApi.getStatus`: This function retrieves the status of a file from the API.
- `kgStatusApi.processPDFs`: This function sends a request to process PDFs to the API.
- `kgStatusApi.extractEntities`: This function sends a request to extract entities from the processed PDFs to the API.
- `kgStatusApi.buildKG`: This function sends a request to build the knowledge graph to the API.
- `kgStatusApi.updateKG`: This function sends a request to update the knowledge graph to the API.
- `kgStatusApi.deletePDFStatus`: This function sends a request to delete the PDF status to the API.
- `kgStatusApi.getStatus`: This function retrieves the knowledge graph status from the API.
- `queryApi.chat`: This function sends a chat query to the API.
- `queryApi.getHistory`: This function retrieves the chat history from the API.
- `graphApi.search`: This function sends a graph search query to the API.
- `graphApi.getStats`: This function retrieves the graph statistics from the API.

## frontend/src/lib/utils.ts
- `cn`: This function is a utility function that combines class names using `clsx` and `tailwind-merge`.

## frontend/src/pages/Index.tsx
- `Index`: This component is the main index page component. It sets up the layout and structure for the Knowledge Graph RAG application, including the document management, knowledge graph status, graph visualization, and AI assistant sections.

## frontend/src/pages/Login.tsx
- `Login`: This component is the login page component. It allows users to enter their username and password to log in to the application.
- `handleLogin`: This function handles the login form submission. It sends a login request to the API, stores the authentication token in local storage, displays a success toast message, and navigates the user to the index page. If there is an error, it displays an error toast message.

## frontend/src/pages/NotFound.tsx
- `NotFound`: This component is the 404 page component. It displays a 404 error message and a link to return to the home page. It also logs the attempted non-existent route to the console.

## frontend/src/pages/Register.tsx
- `Register`: This component is the registration page component. It allows users to enter their username, full name, and password to register for the application.
- `handleRegister`: This function handles the registration form submission. It sends a registration request to the API, displays a success toast message, and navigates the user to the login page. If there is an error, it displays an error toast message.

## pdf_qa_backend/config.py
- `Settings`: This class defines the settings for the application using `pydantic-settings`. It includes settings for the database, JWT, PDF processing, NER model, API, Neo4j, and vector store.

## pdf_qa_backend/main.py
- `lifespan`: This function is an asynchronous context manager that handles the startup and shutdown of the FastAPI application. It connects to Neo4j during startup and closes the connection during shutdown.
- `health_check`: This function is an endpoint that performs a health check and returns a status of "ok".

## pdf_qa_backend/schemas.py
- `ORMBase`: This is a base class for ORM models.
- `UserOut`: This class defines the schema for the user output.
- `UserBase`: This class defines the base schema for the user.
- `UserCreate`: This class defines the schema for creating a user.
- `UserUpdate`: This class defines the schema for updating a user.
- `PDFUploadRequest`: This class defines the schema for a PDF upload request.
- `PDFUploadResponse`: This class defines the schema for a PDF upload response.
- `QuestionRequest`: This class defines the schema for a question request.
- `AnswerResponse`: This class defines the schema for an answer response.
- `GraphDataNode`: This class defines the schema for a graph data node.
- `GraphDataEdge`: This class defines the schema for a graph data edge.
- `GraphData`: This class defines the schema for graph data.
- `ErrorResponse`: This class defines the schema for an error response.
- `TokenData`: This class defines the schema for token data.
- `Token`: This class defines the schema for a token.
- `FileStatus`: This class defines the schema for file status.
- `GraphSearch`: This class defines the schema for a graph search query.
- `GraphStats`: This class defines the schema for graph statistics.
- `QueryHistory`: This class defines the schema for query history.
- `KGStatusResponse`: This class defines the schema for the knowledge graph status response.

## pdf_qa_backend/auth/oauth2.py
- `create_access_token`: This function creates a JWT access token with the given data and expiration time.
- `verify_access_token`: This function verifies the access token and returns the token data.
- `get_current_user`: This function retrieves the current user from the database based on the access token.

## pdf_qa_backend/modules/agent.py
- `SearchAgent`: This class represents a search agent that