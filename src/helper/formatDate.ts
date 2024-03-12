export const formatDate = (inputDate: string) => {
  const date = new Date(inputDate);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
