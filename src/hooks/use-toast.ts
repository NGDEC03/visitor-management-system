import { toast as hotToast } from "react-hot-toast"

export function useToast() {
  return {
    toast: (props: { title: string; description: string }) => {
      hotToast(props.title, {
        description: props.description,
      })
    },
  }
} 