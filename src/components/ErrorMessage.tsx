export function ErrorMessage({ message }: Readonly<{ message: string }>) {
  return (
    <p className="error" role="alert">
      {message}
    </p>
  );
}
