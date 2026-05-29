import "./globals.css";
import Header from "../components/Header";
import Providers from "../components/Providers";

export const metadata = {
  title: "Mini Rede Social",
  description: "Projeto prático de uma Mini Rede Social utilizando Next.js para a disciplina de Programação para Web da faculdade UNDB.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <Header />
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
