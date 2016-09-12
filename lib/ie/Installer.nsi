!include FileFunc.nsh
!include StrFunc.nsh
!define HOME_URL "{{homepage_url}}"
!define Unistall_URL "{{Unistall_URL}}"
!define PRODUCT_NAME "{{name}}"
!define PRODUCT_VERSION "{{version}}"
!define SETUP_NAME "${PRODUCT_NAME}Setup.exe"
OutFile "${SETUP_NAME}"
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
InstallDir "$LOCALAPPDATA\${PRODUCT_NAME}"
InstallDirRegKey HKLM "Software\${PRODUCT_NAME}" ""
ShowInstDetails show
ShowUnInstDetails show
SetCompressor /SOLID lzma
RequestExecutionLevel user

{{#if icon_ie}}
!define MUI_ICON "app\icon.ico"
{{/if}}

{{#if icon_unistall_ie}}
!define MUI_UNICON "app\icon-uninstall.ico"
{{/if}}

{{#if icon_ie}}
Icon "app\icon.ico"
{{/if}}

Section "Unistaller" SecDummy
  SetOutPath "$INSTDIR"
  ;Store installation folder
  ;WriteRegStr HKCU "Software\${PRODUCT_NAME}" "" $INSTDIR
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"   "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"   "UninstallString" "$INSTDIR\Uninstall.exe"
  {{#if icon_unistall_ie}}
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"   "DisplayIcon" "$INSTDIR\app\icon-uninstall.ico"
  {{/if}}
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"   "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"   "Version" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"   "Home" "${HOME_URL}"
   ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Home Page"
  ;set home page
  WriteRegStr HKCU "Software\Microsoft\Internet Explorer\Main"	"Start Page"	"${HOME_URL}"
SectionEnd

Section "icon on ie"
  ;set icon only with admin privileges
  SetRegView 32
  {{#if icon_ie}}
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"Icon"			"$INSTDIR\app\icon.ico"
  {{/if}}
  {{#if icon_unistall_ie}}
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"HotIcon"		"$INSTDIR\app\icon-uninstall.ico"
  {{/if}}
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"ButtonText"	"${PRODUCT_NAME}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"Default Visible" "Yes"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"CLSID"			"{1FBA04EE-3024-11D2-8F1F-0000F87ABD16}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"Exec"			"${HOME_URL}"

  SetRegView 64
  {{#if icon_ie}}
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"Icon"			"$INSTDIR\app\icon.ico"
  {{/if}}
  {{#if icon_unistall_ie}}
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"HotIcon"		"$INSTDIR\app\icon-uninstall.ico"
  {{/if}}
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"ButtonText"	"${PRODUCT_NAME}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"Default Visible" "Yes"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"CLSID"			"{1FBA04EE-3024-11D2-8F1F-0000F87ABD16}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"	"Exec"			"${HOME_URL}"

SectionEnd

Section "Shrotcut"
  {{#with shortcutBool_ie}}
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}.lnk" "${HOME_URL}" "" "$INSTDIR\app\icon.ico" 0
  CreateShortcut "$desktop\${PRODUCT_NAME}.lnk" "${HOME_URL}" "" "$INSTDIR\app\icon.ico" 0
  {{/with}}
SectionEnd

Section "DATA"
	File /r "app"
SectionEnd

Section "Open TYP"
	ExecShell "open" "iexplore.exe" "${success_url}?InstallIE=true"
SectionEnd

Section "Uninstall"
	ExecShell "open" "iexplore.exe" "${Unistall_URL}?UnInstallIE=true"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Internet Explorer\Main"	"Start Page"	""

  Delete  "$SMPROGRAMS\${PRODUCT_NAME}.lnk"
  Delete  "$desktop\${PRODUCT_NAME}.lnk"

  ;remove icon only with admin privileges
  SetRegView 32
  DeleteRegKey HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"
  SetRegView 64
  DeleteRegKey HKLM "SOFTWARE\Microsoft\Internet Explorer\Extensions\{7A74BBCC-24F0-4E94-8166-9236120EAF3F}"
SectionEnd

Function .onInit
	SetSilent silent
FunctionEnd