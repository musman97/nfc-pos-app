package com.posprinter.posprintermodule;

import android.Manifest;
import android.content.pm.PackageManager;
import android.util.DisplayMetrics;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.dantsu.escposprinter.EscPosPrinter;
import com.dantsu.escposprinter.connection.bluetooth.BluetoothPrintersConnections;
import com.dantsu.escposprinter.textparser.PrinterTextParserImg;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.posprinter.MainActivity;
import com.posprinter.R;

import java.util.Objects;

public class PosPrinterModule extends ReactContextBaseJavaModule {
    public PosPrinterModule(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    void print(String textToBePrinted, Promise promise) {
        if (ContextCompat.checkSelfPermission(Objects.requireNonNull(getCurrentActivity()), Manifest.permission.BLUETOOTH) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.BLUETOOTH}, 100);
        } else {
            try {
                showToast("Printing...");
                EscPosPrinter printer = new EscPosPrinter(BluetoothPrintersConnections.selectFirstPaired(), 203, 48f, 32);

                printer
                        .printFormattedText(
                                "[C]<img>" + PrinterTextParserImg.bitmapToHexadecimalString(printer, getCurrentActivity().getResources().getDrawableForDensity(R.mipmap.ic_launcher, DisplayMetrics.DENSITY_MEDIUM)) + "</img>\n" +
                                       textToBePrinted
                        );
                promise.resolve(true);
            } catch (Exception e) {
                e.printStackTrace();
                promise.reject("Exception", "Something went wrong " + e.getMessage());
            }
        }
    }

    private void showToast(String message) {
        Toast.makeText(getCurrentActivity(), message, Toast.LENGTH_SHORT).show();
    }

    @NonNull
    @Override
    public String getName() {
        return "PosPrinterModule";
    }
}
