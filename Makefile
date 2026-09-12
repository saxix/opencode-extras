PREFIX?=${HOME}

help:
	@echo "install-opencode: symlink skills/ and agents/ into ~/.config/opencode"
	@echo "install-claude:   symlink skills/ into ~/.claude/skills"

install-opencode:
	@mkdir -p ${PREFIX}/.config/opencode/
	@ln -sfn "${PWD}/opencode_cfg.jsonc" "${PREFIX}/.config/opencode/opencode.jsonc"
	@ln -sfn "${PWD}/tui_cfg.jsonc" "${PREFIX}/.config/opencode/tui.jsonc"

	@ln -sfn "${PWD}/skills" "${PREFIX}/.config/opencode/skills"
	@ln -sfn "${PWD}/agents" "${PREFIX}/.config/opencode/agents"
	@ln -sfn "${PWD}/commands" "${PREFIX}/.config/opencode/commands"


install-claude:
	ln -sfn "${PWD}/skills" "${PREFIX}/.claude/skills"


clean:
	rm -fr ./~build

test:
	mkdir -p ~build/.config/opencode
	@PREFIX=${PWD}/~build/ $(MAKE) install-opencode
	ls -al ${PWD}/~build/.config/opencode
