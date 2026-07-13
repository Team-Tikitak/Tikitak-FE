package app.tikitak.space;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 스플래시 전용 테마(Theme.SplashScreen)에서 status/navigation bar 색상이
        // 정의된 AppTheme.NoActionBar로 전환. Manifest 테마만으로는 스플래시 종료 후에도
        // 전환되지 않아 흰색 status bar 설정이 적용되지 않았다.
        setTheme(R.style.AppTheme_NoActionBar);
        registerPlugin(NativeCameraPlugin.class);
        super.onCreate(savedInstanceState);
        configureEdgeToEdgeWindow();
    }

    private void configureEdgeToEdgeWindow() {
        Window window = getWindow();

        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attributes = window.getAttributes();
            attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(attributes);
        }
    }
}
