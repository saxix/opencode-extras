UNAME_S := $(shell uname -s 2>/dev/null)
ifeq ($(UNAME_S),)
  WIN := 1
else
  WIN := 0
endif

ifeq ($(WIN),0)
  PREFIX ?= $(HOME)
else
  PREFIX ?= $(shell echo %USERPROFILE%)
endif

DEST = $(PREFIX)/.config/opencode

help:
	@echo "install: symlink skills/, agents/, commands/ into ~/.config/opencode"

ifeq ($(WIN),0)

install:
	@mkdir -p $(DEST)
	@ln -sfn "$(PWD)/src/skills"   "$(DEST)/skills"
	@ln -sfn "$(PWD)/src/agents"   "$(DEST)/agents"
	@ln -sfn "$(PWD)/src/commands" "$(DEST)/commands"

clean:
	rm -fr ./~build

test:
	mkdir -p ~build/.config/opencode
	@PREFIX=$(PWD)/~build/ $(MAKE) install
	ls -al $(PWD)/~build/.config/opencode

else

install:
	@cmd /c "if not exist \"$(DEST)\" mkdir \"$(DEST)\""
	@cmd /c mklink /D "$(DEST)\skills"   "$(PWD)\src\skills"
	@cmd /c mklink /D "$(DEST)\agents"   "$(PWD)\src\agents"
	@cmd /c mklink /D "$(DEST)\commands" "$(PWD)\src\commands"

clean:
	@cmd /c "if exist ~build rmdir /s /q ~build"

test:
	@cmd /c "if not exist ~build\.config\opencode mkdir ~build\.config\opencode"
	@cmd /c set "PREFIX=$(PWD)\~build\" && $(MAKE) install
	@cmd /c dir /b "$(PWD)\~build\.config\opencode"

endif
