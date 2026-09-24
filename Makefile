PREFIX?=${HOME}

help:
	@echo "opencode-utils installer (copy default, per-item coexistence-safe)"
	@echo ""
	@echo "Usage (make wrapper -> npx):"
	@echo "  make install              # global --all (copy)"
	@echo "  make install-project      # project ./.opencode (copy)"
	@echo "  make install-opencode     # global opencode only"
	@echo "  make install-claude       # global claude only"
	@echo "  make install-codex        # global codex only"
	@echo "  make install-all          # global opencode+claude+codex"
	@echo "  make uninstall            # remove global --all"
	@echo ""
	@echo "Direct npx (consumers, no clone needed):"
	@echo "  npx opencode-utils --help"
	@echo "  npx opencode-utils --global --all --copy"
	@echo "  npx opencode-utils --project --all --link   # dev live symlinks"
	@echo ""
	@echo "Makefile delegates to: node ./scripts/install.mjs"

install:
	@node ./scripts/install.mjs --global --all

install-project:
	@node ./scripts/install.mjs --project --all

install-opencode:
	@node ./scripts/install.mjs --global --opencode

install-claude:
	@node ./scripts/install.mjs --global --claude

install-codex:
	@node ./scripts/install.mjs --global --codex

install-all:
	@node ./scripts/install.mjs --global --all

uninstall:
	@node ./scripts/install.mjs --uninstall --global --all

clean:
	rm -fr ./~build

test:
	@mkdir -p ~build/.config/opencode
	@PREFIX=${PWD}/~build node ./scripts/install.mjs --global --opencode --dry-run
	@PREFIX=${PWD}/~build node ./scripts/install.mjs --global --opencode
	@ls -R ${PWD}/~build/.config/opencode
	@echo "--- dry-run project ---"
	@node ./scripts/install.mjs --project --opencode --dry-run
