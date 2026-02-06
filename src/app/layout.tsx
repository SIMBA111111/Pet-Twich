import { cookies } from 'next/headers'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies()

  const cookie = cookieStore.get('userData')?.value

  const isAuth = cookie ? cookie : false

  console.log('cookieStore = ', cookieStore.get('userData')?.value);
  

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
