import swal from "sweetalert";

export const alert = (title: string, data: string, type: string) => {
  return swal(title, data, type);
};

export const warning : any = (buttons : any = ["Cancel", "Delete"], text: string = "Are you sure you want to delete this?"): Promise<boolean> => {
  return swal({
    // title: "Are You Sure!",
    text: text,
    icon: "warning",
    dangerMode: true,
    buttons: buttons,
  });
};

// Delete Warning for category
export const warningForText = (text: string, buttons: any = ["Cancel", "Delete"]): Promise<boolean> => {
  return swal({
    // title: "Are You Sure!",
    text: text,
    icon: "warning",
    dangerMode: true,
    buttons: buttons,
  });
};

// For Permission
export const warningForAccept: any = (buttons: any = ["Cancel", "Yes"], text: string = "Would you like to accept this support request?"): Promise<boolean> => {
  return swal({
    // title: "Are You Sure!",
    text: text,
    icon: "warning",
    dangerMode: true,
    buttons: buttons,
  });
};

// For Permission
export const permissionError = (): Promise<boolean> => {
  return swal({
    title: "Opps! You don't have Permission.",
    icon: "error",
  });
};
