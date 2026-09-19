.PHONY: help install install-opencode install-claude test clean

ifeq ($(OS),Windows_NT)
help:
	@echo "Global install: make install-opencode"
	@echo "Local install: powershell -File scripts/install-opencode.ps1 -WorkspaceRoot C:/path/to/project"
	@echo "Smoke test: powershell -File scripts/test-workspace-install.ps1"

install install-opencode:
	powershell -NoProfile -File scripts/install-opencode.ps1 -Global

install-claude:
	$(error See docs/deploy/installation.md for manual Claude skill installation)

test:
	powershell -NoProfile -File scripts/test-workspace-install.ps1

clean:
	@echo "The Windows smoke test cleans up its own temporary directories."
else
PREFIX ?= $(HOME)
DEST = $(PREFIX)/.config/opencode

help:
	@echo "install-opencode: link definitions under PREFIX/.config/opencode"
	@echo "install-claude: link skills under PREFIX/.claude/skills"

install: install-opencode

install-opencode:
	@mkdir -p "$(DEST)"
	@for name in agents skills commands instructions; do \
		target="$(DEST)/$$name"; source="$(CURDIR)/src/$$name"; \
		if [ -L "$$target" ] && [ "$$(readlink "$$target")" = "$$source" ]; then \
			:; \
		elif [ -e "$$target" ] || [ -L "$$target" ]; then \
			echo "Destination already exists: $$target"; exit 1; \
		else ln -s "$$source" "$$target" || exit 1; fi; \
	done

install-claude:
	@mkdir -p "$(PREFIX)/.claude"
	@if [ -L "$(PREFIX)/.claude/skills" ] && [ "$$(readlink "$(PREFIX)/.claude/skills")" = "$(CURDIR)/src/skills" ]; then \
		:; \
	elif [ -e "$(PREFIX)/.claude/skills" ] || [ -L "$(PREFIX)/.claude/skills" ]; then \
		echo "Destination already exists: $(PREFIX)/.claude/skills"; exit 1; \
	else ln -s "$(CURDIR)/src/skills" "$(PREFIX)/.claude/skills"; fi

test:
	@$(MAKE) PREFIX="$(CURDIR)/~build" install-opencode
	@$(MAKE) PREFIX="$(CURDIR)/~build" install-opencode
	@ls -ld "$(CURDIR)/~build/.config/opencode/"*

clean:
	rm -rf "$(CURDIR)/~build"
endif
