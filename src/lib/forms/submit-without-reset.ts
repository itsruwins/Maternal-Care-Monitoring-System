import { startTransition, type FormEvent } from "react";

// React 19 clears a <form action={...}>'s fields every time it submits, even
// when the server only sends back "fix this field". Use this as the form's
// onSubmit instead, so a mistake doesn't wipe what was typed:
//   <form action={formAction} onSubmit={submitWithoutReset(formAction)}>
// Forms that should clear after saving remount themselves (a changing `key`).
export function submitWithoutReset(action: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => action(formData));
  };
}
