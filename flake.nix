{
   description = "Development environment for a Rust + GTK + Webkit project";

   inputs = {
      nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
   };

   outputs = { self, nixpkgs }: {
      devShells.x86_64-linux.default = let
         pkgs = import nixpkgs {
            system = "x86_64-linux";
         };
      in pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
               pkg-config
               nodejs
               yarn
            ];

            buildInputs = with pkgs; [
               dbus
               pkg-config
               yarn
               gdk-pixbuf
               glib
               gtk3
               harfbuzz
               librsvg
               libsoup_3
               pango
               openssl
            ];
            shellHook = ''
               export XDG_DATA_DIRS=${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS
               '';
         };
   };
}

