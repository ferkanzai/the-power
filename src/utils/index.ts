export const isEmptyBody = (body: Record<string, unknown>) => {
  return Object.keys(body).length === 0;
};

export const creatRandomAccountNumber = () => {
  return Math.floor(Math.random() * 10000000000);
}

export const generateRandomPassword = (length = 14) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}