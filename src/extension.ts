import {
  Disposable,
  LanguageClient,
  executable,
  workspace,
  window,
} from "coc.nvim";
import type {
  ExtensionContext,
  LanguageClientOptions,
  ServerOptions,
} from "coc.nvim";

const getServerCommand = (cmd: string) => {
  if (cmd.endsWith("opam")) {
    return { command: "opam", args: ["exec", "--", "ocamllsp"] };
  }

  if (cmd.endsWith("dune")) {
    return { command: "dune", args: ["exec", "--", "ocamllsp"] };
  }

  throw new Error(`Unsupported command: ${cmd}`);
};

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration("coc-ocaml");
  if (!config.get<boolean>("enabled", false)) {
    return;
  }
  const { command, args } = getServerCommand(
    config.get<string>("lspStartCommand", "opam"),
  );

  if (!executable(command)) {
    window.showErrorMessage(
      `Failed to find executable ${command}. Please install it.`,
    );
    return;
  }

  const serverOptions: ServerOptions = {
    command,
    args,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "ocaml" },
      { scheme: "file", language: "reason" },
      { scheme: "file", pattern: "**/dune-project" },
    ],
    initializationOptions: {
      codelens: { enable: true },
      diagnostics: { enable: true },
      duneDiagnostics: { enable: executable("dune") },
      extendedHover: { enable: true },
    },
  };

  const client = new LanguageClient(
    "ocaml",
    "OCaml Language Server",
    serverOptions,
    clientOptions,
  );

  context.subscriptions.push(
    Disposable.create(async () => {
      await client.stop();
    }),
  );

  await client.start();
}
