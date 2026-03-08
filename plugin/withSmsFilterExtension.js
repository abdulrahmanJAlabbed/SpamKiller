const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withSmsFilterExtension = (config) => {
    config = withXcodeProject(config, (config) => {
        const xcodeProject = config.modResults;
        const appProject = xcodeProject.getFirstProject().firstProject;
        const targetName = 'MessageFilterExtension';

        // Add the extension target
        const extTarget = xcodeProject.addTarget(targetName, 'app_extension', 'MessageFilterExtension');

        // Note: The actual full Xcode target creation logic (adding files, build phases, frameworks) 
        // is complex for prebuild. A robust solution uses libraries like `expo-apple-targets` or 
        // deep Xcode modifications which we'll configure by injecting the swift files directly.

        return config;
    });

    config = withDangerousMod(config, [
        'ios',
        async (config) => {
            const extensionPath = path.join(config.modRequest.platformProjectRoot, 'MessageFilterExtension');
            fs.mkdirSync(extensionPath, { recursive: true });

            const swiftContent = `
import IdentityLookup

final class MessageFilterExtension: ILMessageFilterExtension {}

extension MessageFilterExtension: ILMessageFilterQueryHandling {
    func handle(_ queryRequest: ILMessageFilterQueryRequest, context: ILMessageFilterExtensionContext, completion: @escaping (ILMessageFilterQueryResponse) -> Void) {
        let response = ILMessageFilterQueryResponse()
        let action: ILMessageFilterAction = .none

        guard let messageBody = queryRequest.messageBody?.lowercased() else {
            response.action = action
            completion(response)
            return
        }

        // Default to allow
        response.action = .allow

        // Read keywords from UserDefaults (AppGroup shared)
        if let sharedDefaults = UserDefaults(suiteName: "group.com.cellaz.SpamKiller"),
           let keywords = sharedDefaults.stringArray(forKey: "blockedKeywords") {
            for keyword in keywords {
                if messageBody.contains(keyword.lowercased()) {
                    response.action = .junk
                    break
                }
            }
        }

        completion(response)
    }
}
`;
            fs.writeFileSync(path.join(extensionPath, 'MessageFilterExtension.swift'), swiftContent.trim());

            const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>$(DEVELOPMENT_LANGUAGE)</string>
	<key>CFBundleDisplayName</key>
	<string>SpamKiller Filter</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>com.cellaz.SpamKiller.MessageFilterExtension</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>NSExtension</key>
	<dict>
		<key>NSExtensionPointIdentifier</key>
		<string>com.apple.identitylookup.message-filter</string>
		<key>NSExtensionPrincipalClass</key>
		<string>$(PRODUCT_MODULE_NAME).MessageFilterExtension</string>
	</dict>
</dict>
</plist>`;
            fs.writeFileSync(path.join(extensionPath, 'Info.plist'), plistContent.trim());

            return config;
        },
    ]);

    return config;
};

module.exports = withSmsFilterExtension;
