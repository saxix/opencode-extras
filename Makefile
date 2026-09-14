PREFIX?=${HOME}

help:
	@echo "install-opencode: symlink skills/ and agents/ into ~/.config/opencode"
	@echo "install-claude:   symlink skills/ into ~/.claude/skills"

install:
	@mkdir -p ${PREFIX}/.config/opencode/
	@ln -sfn "${PWD}/src/opencode_cfg.jsonc" "${PREFIX}/.config/opencode/opencode.jsonc"
	@ln -sfn "${PWD}/src/tui_cfg.jsonc" "${PREFIX}/.config/opencode/tui.jsonc"

	@ln -sfn "${PWD}/src/skills" "${PREFIX}/.config/opencode/skills"
	@ln -sfn "${PWD}/src/agents" "${PREFIX}/.config/opencode/agents"
	@ln -sfn "${PWD}/src/commands" "${PREFIX}/.config/opencode/commands"


clean:
	rm -fr ./~build

test:
	mkdir -p ~build/.config/opencode
	@PREFIX=${PWD}/~build/ $(MAKE) install-opencode
	ls -al ${PWD}/~build/.config/opencode
