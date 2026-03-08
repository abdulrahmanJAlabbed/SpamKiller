const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withAndroidSmsReceiver = (config) => {
    config = withAndroidManifest(config, (config) => {
        const androidManifest = config.modResults.manifest;

        // Add RECEIVE_SMS permission
        if (!androidManifest['uses-permission']) {
            androidManifest['uses-permission'] = [];
        }

        const hasReceiveSMS = androidManifest['uses-permission'].some(
            (p) => p.$['android:name'] === 'android.permission.RECEIVE_SMS'
        );
        if (!hasReceiveSMS) {
            androidManifest['uses-permission'].push({
                $: { 'android:name': 'android.permission.RECEIVE_SMS' }
            });
        }

        // Add Broadcast Receiver to application block
        const application = androidManifest.application[0];
        if (!application.receiver) {
            application.receiver = [];
        }

        application.receiver.push({
            $: {
                'android:name': '.SmsReceiver',
                'android:enabled': 'true',
                'android:exported': 'true',
                'android:permission': 'android.permission.BROADCAST_SMS'
            },
            'intent-filter': [{
                $: { 'android:priority': '999' },
                action: [{ $: { 'android:name': 'android.provider.Telephony.SMS_RECEIVED' } }]
            }]
        });

        return config;
    });

    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const packagePath = 'com/cellaz/SpamKiller';
            const javaDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/java', packagePath);
            fs.mkdirSync(javaDir, { recursive: true });

            const javaContent = `
package com.cellaz.SpamKiller;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsReceiver extends BroadcastReceiver {
    private static final String PREFS_NAME = "SpamKillerPrefs";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals("android.provider.Telephony.SMS_RECEIVED")) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                try {
                    Object[] pdus = (Object[]) bundle.get("pdus");
                    if (pdus == null) return;
                    
                    StringBuilder body = new StringBuilder();
                    for (Object pdu : pdus) {
                        SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                        body.append(smsMessage.getMessageBody());
                    }

                    String messageBody = body.toString().toLowerCase();
                    
                    // Read keywords from SharedPreferences
                    SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                    String keywordsStr = prefs.getString("blockedKeywords", "");
                    
                    if (!keywordsStr.isEmpty()) {
                        String[] keywords = keywordsStr.split(",");
                        for (String keyword : keywords) {
                            if (messageBody.contains(keyword.toLowerCase().trim())) {
                                Log.d("SpamKiller", "Spam blocked natively matching keyword: " + keyword);
                                abortBroadcast(); // Prevent notification
                                break;
                            }
                        }
                    }
                } catch (Exception e) {
                    Log.e("SpamKiller", "Exception in SmsReceiver", e);
                }
            }
        }
    }
}
`;
            fs.writeFileSync(path.join(javaDir, 'SmsReceiver.java'), javaContent.trim());
            return config;
        },
    ]);

    return config;
};

module.exports = withAndroidSmsReceiver;
