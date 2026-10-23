import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();

// 1. Gradle root files
zip.file('gradlew', '#!/usr/bin/env sh\nexec gradle "$@"\n');
zip.file('gradlew.bat', '@rem Gradle execution script for Windows\n');
zip.file('settings.gradle.kts', `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "SmartAlert"
include(":app")
`);

zip.file('build.gradle.kts', `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`);

zip.file('gradle/wrapper/gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

zip.file('gradle/libs.versions.toml', `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntime = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.01"
ksp = "2.0.21-1.0.27"

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`);

// 2. App-level build
zip.file('app/build.gradle.kts', `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.smartalert.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.smartalert.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.3.0")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Location & Geofencing
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // WorkManager & Exact Alarms
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    // Core KTX & Coroutines
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
`);

// 3. AndroidManifest.xml
zip.file('app/src/main/AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

    <application
        android:name=".SmartAlertApplication"
        android:allowBackup="true"
        android:icon="@android:drawable/ic_popup_reminder"
        android:label="SmartAlert"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:showOnLockScreen="true"
            android:turnScreenOn="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".reminders.AlarmReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="com.smartalert.ACTION_TRIGGER_ALARM" />
            </intent-filter>
        </receiver>

        <receiver
            android:name=".geofence.GeofenceBroadcastReceiver"
            android:exported="true"
            android:permission="android.permission.BIND_JOB_SERVICE" />

        <receiver
            android:name=".reminders.BootReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>
`);

// 4. Kotlin Source Files
zip.file('app/src/main/java/com/smartalert/app/SmartAlertApplication.kt', `package com.smartalert.app

import android.app.Application

class SmartAlertApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/MainActivity.kt', `package com.smartalert.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.smartalert.app.ui.screens.SmartAlertMainScreen

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                var hasNotificationPermission by remember {
                    mutableStateOf(
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            ContextCompat.checkSelfPermission(
                                this,
                                Manifest.permission.POST_NOTIFICATIONS
                            ) == PackageManager.PERMISSION_GRANTED
                        } else true
                    )
                }

                val permissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission()
                ) { isGranted ->
                    hasNotificationPermission = isGranted
                }

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotificationPermission) {
                        permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SmartAlertMainScreen()
                }
            }
        }
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/data/Task.kt', `package com.smartalert.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class Priority {
    LOW, MEDIUM, HIGH, URGENT
}

@Entity(tableName = "tasks")
data class Task(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val notes: String = "",
    val category: String = "General",
    val priority: Priority = Priority.MEDIUM,
    val dueDateMillis: Long? = null,
    val reminderTimeMillis: Long? = null,
    val isCompleted: Boolean = false,
    val completedAtMillis: Long? = null,
    val createdAtMillis: Long = System.currentTimeMillis(),

    // Geofencing attributes
    val locationName: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val geofenceRadiusMeters: Float? = 150f,
    val geofenceTriggerEnter: Boolean = true,

    // High Priority & DND configuration
    val highPriorityDndAlert: Boolean = false
)
`);

zip.file('app/src/main/java/com/smartalert/app/data/TaskDao.kt', `package com.smartalert.app.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY isCompleted ASC, priority DESC, dueDateMillis ASC")
    fun getAllTasks(): Flow<List<Task>>

    @Query("SELECT * FROM tasks WHERE isCompleted = 0 ORDER BY priority DESC, dueDateMillis ASC")
    fun getPendingTasks(): Flow<List<Task>>

    @Query("SELECT * FROM tasks WHERE isCompleted = 1 ORDER BY completedAtMillis DESC")
    fun getCompletedTasks(): Flow<List<Task>>

    @Query("SELECT * FROM tasks WHERE reminderTimeMillis IS NOT NULL AND isCompleted = 0")
    fun getTasksWithReminders(): Flow<List<Task>>

    @Query("SELECT * FROM tasks WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND isCompleted = 0")
    fun getGeofencedTasks(): Flow<List<Task>>

    @Query("SELECT * FROM tasks WHERE id = :id LIMIT 1")
    suspend fun getTaskById(id: Long): Task?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: Task): Long

    @Update
    suspend fun updateTask(task: Task)

    @Delete
    suspend fun deleteTask(task: Task)

    @Query("UPDATE tasks SET isCompleted = :completed, completedAtMillis = :completedAt WHERE id = :id")
    suspend fun setTaskCompleted(id: Long, completed: Boolean, completedAt: Long?)
}
`);

zip.file('app/src/main/java/com/smartalert/app/data/AppDatabase.kt', `package com.smartalert.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [Task::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun taskDao(): TaskDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "smartalert_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/notifications/NotificationHelper.kt', `package com.smartalert.app.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import com.smartalert.app.MainActivity

class NotificationHelper(private val context: Context) {

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    companion object {
        const val CHANNEL_REMINDERS = "channel_smartalert_reminders"
        const val CHANNEL_GEOFENCE = "channel_smartalert_geofence"
        const val CHANNEL_URGENT_ALARM = "channel_smartalert_urgent_alarm"
    }

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)

            val alarmAudioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()

            val reminderChannel = NotificationChannel(
                CHANNEL_REMINDERS,
                "SmartAlert Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Standard task due date and time alerts"
                enableVibration(true)
            }

            val geofenceChannel = NotificationChannel(
                CHANNEL_GEOFENCE,
                "Location & Store Arrival",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Triggered when you arrive near grocery stores or supermarkets"
                enableVibration(true)
            }

            val urgentAlarmChannel = NotificationChannel(
                CHANNEL_URGENT_ALARM,
                "Urgent Alarms (DND Bypass Candidate)",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Urgent high-priority alarms categorized as ALARM for DND priority filtering"
                setSound(alarmSound, alarmAudioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 500)
                setBypassDnd(true)
            }

            notificationManager.createNotificationChannels(
                listOf(reminderChannel, geofenceChannel, urgentAlarmChannel)
            )
        }
    }

    fun isDndPolicyAccessGranted(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            notificationManager.isNotificationPolicyAccessGranted
        } else {
            true
        }
    }

    fun createDndSettingsIntent(): Intent {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
        } else {
            Intent(Settings.ACTION_SETTINGS)
        }
    }

    fun showTaskReminderNotification(taskId: Long, title: String, notes: String, isUrgent: Boolean) {
        val channelId = if (isUrgent) CHANNEL_URGENT_ALARM else CHANNEL_REMINDERS

        val tapIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("EXTRA_TASK_ID", taskId)
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            taskId.toInt(),
            tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("⏰ SmartAlert: \$title")
            .setContentText(if (notes.isNotBlank()) notes else "Reminder due right now!")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(if (isUrgent) NotificationCompat.CATEGORY_ALARM else NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        notificationManager.notify(taskId.toInt(), builder.build())
    }

    fun showGeofenceNotification(taskId: Long, title: String, locationName: String) {
        val tapIntent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context,
            (taskId + 9999).toInt(),
            tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, CHANNEL_GEOFENCE)
            .setSmallIcon(android.R.drawable.ic_dialog_map)
            .setContentTitle("📍 Arrived near \$locationName")
            .setContentText("Don't forget: \$title")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_EVENT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        notificationManager.notify((taskId + 9999).toInt(), builder.build())
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/reminders/AlarmScheduler.kt', `package com.smartalert.app.reminders

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.smartalert.app.data.Task

class AlarmScheduler(private val context: Context) {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    fun scheduleTaskAlarm(task: Task) {
        val reminderTime = task.reminderTimeMillis ?: return
        if (reminderTime <= System.currentTimeMillis()) return

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = "com.smartalert.ACTION_TRIGGER_ALARM"
            putExtra("EXTRA_TASK_ID", task.id)
            putExtra("EXTRA_TASK_TITLE", task.title)
            putExtra("EXTRA_TASK_NOTES", task.notes)
            putExtra("EXTRA_IS_URGENT", task.highPriorityDndAlert)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            task.id.toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    reminderTime,
                    pendingIntent
                )
            } else {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    reminderTime,
                    pendingIntent
                )
            }
        } else {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                reminderTime,
                pendingIntent
            )
        }
    }

    fun cancelTaskAlarm(taskId: Long) {
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = "com.smartalert.ACTION_TRIGGER_ALARM"
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            taskId.toInt(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/reminders/AlarmReceiver.kt', `package com.smartalert.app.reminders

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.smartalert.app.notifications.NotificationHelper

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val taskId = intent.getLongExtra("EXTRA_TASK_ID", -1L)
        val title = intent.getStringExtra("EXTRA_TASK_TITLE") ?: "SmartAlert Task Reminder"
        val notes = intent.getStringExtra("EXTRA_TASK_NOTES") ?: ""
        val isUrgent = intent.getBooleanExtra("EXTRA_IS_URGENT", false)

        val helper = NotificationHelper(context)
        helper.showTaskReminderNotification(taskId, title, notes, isUrgent)
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/reminders/BootReceiver.kt', `package com.smartalert.app.reminders

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.smartalert.app.data.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val scheduler = AlarmScheduler(context)
            val db = AppDatabase.getDatabase(context)
            CoroutineScope(Dispatchers.IO).launch {
                val tasks = db.taskDao().getTasksWithReminders().first()
                for (task in tasks) {
                    scheduler.scheduleTaskAlarm(task)
                }
            }
        }
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/geofence/GeofenceManager.kt', `package com.smartalert.app.geofence

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.smartalert.app.data.Task

class GeofenceManager(private val context: Context) {

    private val geofencingClient: GeofencingClient = LocationServices.getGeofencingClient(context)

    private val geofencePendingIntent: PendingIntent by lazy {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java)
        PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
    }

    fun registerGeofence(task: Task, onComplete: (Boolean, String?) -> Unit) {
        val lat = task.latitude ?: return
        val lon = task.longitude ?: return
        val radius = task.geofenceRadiusMeters ?: 150f

        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            onComplete(false, "Location permission not granted")
            return
        }

        val geofence = Geofence.Builder()
            .setRequestId("GEOFENCE_\${task.id}")
            .setCircularRegion(lat, lon, radius)
            .setExpirationDuration(Geofence.NEVER_EXPIRE)
            .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT)
            .build()

        val geofencingRequest = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofence(geofence)
            .build()

        try {
            geofencingClient.addGeofences(geofencingRequest, geofencePendingIntent)
                .addOnSuccessListener { onComplete(true, null) }
                .addOnFailureListener { error -> onComplete(false, error.localizedMessage) }
        } catch (e: SecurityException) {
            onComplete(false, e.localizedMessage)
        }
    }

    fun removeGeofence(taskId: Long) {
        geofencingClient.removeGeofences(listOf("GEOFENCE_\$taskId"))
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/geofence/GeofenceBroadcastReceiver.kt', `package com.smartalert.app.geofence

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import com.smartalert.app.notifications.NotificationHelper

class GeofenceBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent) ?: return
        if (geofencingEvent.hasError()) return

        val transition = geofencingEvent.geofenceTransition
        if (transition == Geofence.GEOFENCE_TRANSITION_ENTER) {
            val triggeringGeofences = geofencingEvent.triggeringGeofences ?: return
            val helper = NotificationHelper(context)

            for (geofence in triggeringGeofences) {
                val requestId = geofence.requestId
                val taskId = requestId.removePrefix("GEOFENCE_").toLongOrNull() ?: 1L
                helper.showGeofenceNotification(
                    taskId = taskId,
                    title = "You have arrived near your reminder location!",
                    locationName = "Target / Supermarket Zone"
                )
            }
        }
    }
}
`);

zip.file('app/src/main/java/com/smartalert/app/ui/screens/SmartAlertMainScreen.kt', `package com.smartalert.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SmartAlertMainScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Today") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.Place, contentDescription = "Locations") },
                    label = { Text("Geofences") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Warning, contentDescription = "DND Status") },
                    label = { Text("DND Deep Dive") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings") }
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedTab) {
                0 -> {
                    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                        Text(
                            text = "Quick Add",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            item {
                                QuickAddChip(
                                    title = "Groceries",
                                    subtitle = "Whole Foods",
                                    icon = Icons.Default.ShoppingCart,
                                    onClick = { }
                                )
                            }
                            item {
                                QuickAddChip(
                                    title = "Meeting",
                                    subtitle = "DND Alarm",
                                    icon = Icons.Default.DateRange,
                                    onClick = { }
                                )
                            }
                            item {
                                QuickAddChip(
                                    title = "Study",
                                    subtitle = "Focus block",
                                    icon = Icons.Default.Star,
                                    onClick = { }
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        WeeklyProductivityCard(completedCount = 14, pendingCount = 5, rate = 74)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Today's Tasks & Upcoming Alarms", style = MaterialTheme.typography.titleMedium)
                    }
                }
                1 -> Text("SmartAlert Location Geofences (Supermarket triggers)")
                2 -> Text("Android DND Investigation & Policy Access Guide")
                3 -> Text("Settings & Notification Permissions")
            }
        }
    }
}

@Composable
fun QuickAddChip(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    ElevatedCard(
        onClick = onClick,
        modifier = Modifier.width(130.dp),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(6.dp))
            Text(title, style = MaterialTheme.typography.labelMedium)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
        }
    }
}

@Composable
fun WeeklyProductivityCard(completedCount: Int, pendingCount: Int, rate: Int) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Weekly Productivity Trends", style = MaterialTheme.typography.titleSmall)
                Text("Success: $rate%", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelMedium)
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text("Completed ($completedCount) vs Pending ($pendingCount)", style = MaterialTheme.typography.bodySmall)
        }
    }
}
`);

zip.file('README.md', `# SmartAlert - Native Android Hackathon App
Built with **Kotlin** and **Jetpack Compose** (Material 3).

## 🚀 How to Install on Your Android Phone for FREE (No Subscription Required!)
You do **not** need a paid Google Play Console Developer Account ($25/year) to run SmartAlert on your real Android phone.

### Step 1: Enable Developer Options on your Phone (Free)
1. On your Android phone, go to **Settings** > **About Phone**.
2. Tap **Build Number** 7 times until you see "You are now a developer!".
3. Go back to **Settings** > **System** (or **Developer Options**).
4. Turn ON **USB Debugging** (or **Wireless Debugging** if on Android 11+).

### Step 2: Open in Android Studio (Free)
1. Download & install free [Android Studio](https://developer.android.com/studio).
2. Unzip this project folder and select **File** > **Open** in Android Studio.
3. Wait for Gradle Sync to complete (takes ~60 seconds on initial load).

### Step 3: Run Directly on your Phone
1. Connect your phone via USB cable (or pair via QR code in Wireless Debugging).
2. Your phone model will appear in the top device dropdown in Android Studio.
3. Click the green **Run ▶** button (or press Shift + F10).
4. Android Studio compiles the Debug APK and installs it straight onto your phone!

### Step 4: Or Build Standalone Debug APK
\`\`\`bash
./gradlew assembleDebug
\`\`\`
Output APK is located at: \`app/build/outputs/apk/debug/app-debug.apk\`.

---

## ⚡ Android Limitation: Do Not Disturb (DND)
- **No third-party app can bypass DND silently without user permission.**
- **The Required Special User-Granted Permission:**
  - The app requests **Notification Policy Access** (\`android.permission.ACCESS_NOTIFICATION_POLICY\`).
  - System Settings Intent: \`Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)\`.
- **Category Alarm Rules:**
  - High-priority alarms use \`NotificationCompat.setCategory(NotificationCompat.CATEGORY_ALARM)\` and \`AudioAttributes.USAGE_ALARM\`.
  - In Android's DND settings, if the user allows "Alarms", alarms configured with \`USAGE_ALARM\` will audibly sound even when DND is active.
`);

// Generate ZIP
fs.mkdirSync('public', { recursive: true });
const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync('public/SmartAlert-Android-Project.zip', buffer);
console.log('Successfully generated public/SmartAlert-Android-Project.zip (' + buffer.length + ' bytes)');
