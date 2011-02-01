/*
 * See the LICENSE file for the license on the source code in this file.
 */

#import "iPhoneSimulator.h"
#import "NSString+expandPath.h"
#import "nsprintf.h"
#import <sys/types.h>
#import <sys/stat.h>

/**
 * A simple iPhoneSimulatorRemoteClient framework.
 */
@implementation iPhoneSimulator

- (void) printUsage {
  fprintf(stderr, "Usage: ios-sim <command> <options> [--args ...]\n");
  fprintf(stderr, "\n");
  fprintf(stderr, "Commands:\n");
  fprintf(stderr, "  showsdks                        List the available iOS SDK versions\n");
  fprintf(stderr, "  launch <application path>       Launch the application at the specified path on the iOS Simulator\n");
  fprintf(stderr, "\n");
  fprintf(stderr, "Options:\n");
  fprintf(stderr, "  --version                       Print the version of ios-sim\n");
  fprintf(stderr, "  --help                          Show this help text\n");
  fprintf(stderr, "  --verbose                       Set the output level to verbose\n");
  fprintf(stderr, "  --exit                          Exit after startup\n");
  fprintf(stderr, "  --sdk <sdkversion>              The iOS SDK version to run the application on (defaults to the latest)\n");
  fprintf(stderr, "  --family <device family>        The device type that should be simulated (defaults to `iphone')\n");
  fprintf(stderr, "  --uuid <uuid>                   A UUID identifying the session (is that correct?)\n");
  fprintf(stderr, "  --env <environment file path>   A plist file containing environment key-value pairs that should be set\n");
  fprintf(stderr, "  --setenv NAME=VALUE             Set an environment variable\n");
  fprintf(stderr, "  --stdout <stdout file path>     The path where stdout of the simulator will be redirected to (defaults to stdout of iphonesim)\n");
  fprintf(stderr, "  --stderr <stderr file path>     The path where stderr of the simulator will be redirected to (defaults to stderr of iphonesim)\n");
  fprintf(stderr, "  --args <...>                    All following arguments will be passed on to the application\n");
}


- (int) showSDKs {
  NSArray *roots = [DTiPhoneSimulatorSystemRoot knownRoots];

  nsprintf(@"Simulator SDK Roots:");
  for (DTiPhoneSimulatorSystemRoot *root in roots) {
    nsfprintf(stderr, @"'%@' (%@)\n\t%@", [root sdkDisplayName], [root sdkVersion], [root sdkRootPath]);
  }

  return EXIT_SUCCESS;
}


- (void)session:(DTiPhoneSimulatorSession *)session didEndWithError:(NSError *)error {
  if (verbose) {
    nsprintf(@"Session did end with error %@", error);
  }

  if (stderrFileHandle != nil) {
    NSString *stderrPath = [[session sessionConfig] simulatedApplicationStdErrPath];
    [self removeStdioFIFO:stderrFileHandle atPath:stderrPath];
  }

  if (stdoutFileHandle != nil) {
    NSString *stdoutPath = [[session sessionConfig] simulatedApplicationStdOutPath];
    [self removeStdioFIFO:stdoutFileHandle atPath:stdoutPath];
  }

  if (error != nil) {
    exit(EXIT_FAILURE);
  }

  exit(EXIT_SUCCESS);
}


- (void)session:(DTiPhoneSimulatorSession *)session didStart:(BOOL)started withError:(NSError *)error {
  if (started) {
    if (verbose) {
      nsprintf(@"Session started");
    }
    if (exit_on_startup) {
      exit(EXIT_SUCCESS);
    }
  } else {
    nsprintf(@"Session could not be started: %@", error);
    exit(EXIT_FAILURE);
  }
}


- (void)stdioDataIsAvailable:(NSNotification *)notification {
  NSData *data = [[notification userInfo] valueForKey:NSFileHandleNotificationDataItem];
  NSString *str = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  if ([notification object] == stdoutFileHandle) {
    printf("%s", [str UTF8String]);
  } else {
    nsprintf(str);
  }
}


- (void)createStdioFIFO:(NSFileHandle **)fileHandle ofType:(NSString *)type atPath:(NSString **)path {
  *path = [NSString stringWithFormat:@"/tmp/iphonesim-%@-pipe-%d", type, (int)time(NULL)];
  if (mkfifo([*path UTF8String], S_IRUSR | S_IWUSR) == -1) {
    nsprintf(@"Unable to create %@ named pipe `%@'", type, *path);
    exit(EXIT_FAILURE);
  } else {
    if (verbose) {
      nsprintf(@"Creating named pipe at `%@'", *path);
    }
    int fd = open([*path UTF8String], O_RDONLY | O_NDELAY);
    *fileHandle = [[[NSFileHandle alloc] initWithFileDescriptor:fd] retain];
    [*fileHandle readInBackgroundAndNotify];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(stdioDataIsAvailable:)
                                                 name:NSFileHandleReadCompletionNotification
                                               object:*fileHandle];
  }
}


- (void)removeStdioFIFO:(NSFileHandle *)fileHandle atPath:(NSString *)path {
  if (verbose) {
    nsprintf(@"Removing named pipe at `%@'", path);
  }
  [fileHandle closeFile];
  [fileHandle release];
  if (![[NSFileManager defaultManager] removeItemAtPath:path error:NULL]) {
    nsprintf(@"Unable to remove named pipe `%@'", path);
  }
}


- (int)launchApp:(NSString *)path withFamily:(NSString *)family
                                        uuid:(NSString *)uuid
                                 environment:(NSDictionary *)environment
                                  stdoutPath:(NSString *)stdoutPath
                                  stderrPath:(NSString *)stderrPath
                                        args:(NSArray *)args {
  DTiPhoneSimulatorApplicationSpecifier *appSpec;
  DTiPhoneSimulatorSessionConfig *config;
  DTiPhoneSimulatorSession *session;
  NSError *error;

  /* Create the app specifier */
  appSpec = [DTiPhoneSimulatorApplicationSpecifier specifierWithApplicationPath:path];
  if (appSpec == nil) {
    nsprintf(@"Could not load application specification for %s", path);
    return EXIT_FAILURE;
  }
  if (verbose) {
    nsprintf(@"App Spec: %@", appSpec);
    nsprintf(@"SDK Root: %@", sdkRoot);

    for (id key in environment) {
      nsprintf(@"Env: %@ = %@", key, [environment objectForKey:key]);
    }
  }

  /* Set up the session configuration */
  config = [[[DTiPhoneSimulatorSessionConfig alloc] init] autorelease];
  [config setApplicationToSimulateOnStart:appSpec];
  [config setSimulatedSystemRoot:sdkRoot];
  [config setSimulatedApplicationShouldWaitForDebugger: NO];

  [config setSimulatedApplicationLaunchArgs:args];
  [config setSimulatedApplicationLaunchEnvironment:environment];

  if (stderrPath) {
    stderrFileHandle = nil;
  } else if (!exit_on_startup) {
    [self createStdioFIFO:&stderrFileHandle ofType:@"stderr" atPath:&stderrPath];
  }
  [config setSimulatedApplicationStdErrPath:stderrPath];

  if (stdoutPath) {
    stdoutFileHandle = nil;
  } else if (!exit_on_startup) {
    [self createStdioFIFO:&stdoutFileHandle ofType:@"stdout" atPath:&stdoutPath];
  }
  [config setSimulatedApplicationStdOutPath:stdoutPath];

  [config setLocalizedClientName: @"iphonesim"];

  // this was introduced in 3.2 of SDK
  if ([config respondsToSelector:@selector(setSimulatedDeviceFamily:)]) {
    if (family == nil) {
      family = @"iphone";
    }

    if (verbose) {
      nsprintf(@"using device family %@",family);
    }

    if ([family isEqualToString:@"ipad"]) {
[config setSimulatedDeviceFamily:[NSNumber numberWithInt:2]];
    } else{
      [config setSimulatedDeviceFamily:[NSNumber numberWithInt:1]];
    }
  }

  /* Start the session */
  session = [[[DTiPhoneSimulatorSession alloc] init] autorelease];
  [session setDelegate:self];
  [session setSimulatedApplicationPID: [NSNumber numberWithInt:35]];
  if (uuid != nil){
    [session setUuid:uuid];
  }

  if (![session requestStartWithConfig:config timeout:30 error:&error]) {
    nsprintf(@"Could not start simulator session: %@", error);
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}


/**
 * Execute 'main'
 */
- (void)runWithArgc:(int)argc argv:(char **)argv {
  if (argc < 2) {
    [self printUsage];
    exit(EXIT_FAILURE);
  }

  if (strcmp(argv[1], "showsdks") == 0) {
    exit([self showSDKs]);
  } else if (strcmp(argv[1], "launch") == 0) {
    if (argc < 3) {
      fprintf(stderr, "Missing application path argument\n");
      [self printUsage];
      exit(EXIT_FAILURE);
    }

    NSString *appPath = [[NSString stringWithUTF8String:argv[2]] expandPath];
    NSString *family = nil;
    NSString *uuid = nil;
    NSString *stdoutPath = nil;
    NSString *stderrPath = nil;
    NSMutableDictionary *environment = [NSMutableDictionary dictionary];
    int i = 3;
    for (; i < argc; i++) {
      if (strcmp(argv[i], "--version") == 0) {
        printf("%s\n", IOS_SIM_VERSION);
        exit(EXIT_SUCCESS);
      } else if (strcmp(argv[i], "--help") == 0) {
        [self printUsage];
        exit(EXIT_SUCCESS);
      } else if (strcmp(argv[i], "--verbose") == 0) {
        verbose = YES;
      } else if (strcmp(argv[i], "--exit") == 0) {
        exit_on_startup = YES;
      }
      else if (strcmp(argv[i], "--sdk") == 0) {
        i++;
        NSString* ver = [NSString stringWithCString:argv[i] encoding:NSUTF8StringEncoding];
        NSArray *roots = [DTiPhoneSimulatorSystemRoot knownRoots];
        for (DTiPhoneSimulatorSystemRoot *root in roots) {
          NSString *v = [root sdkVersion];
          if ([v isEqualToString:ver]) {
            sdkRoot = root;
            break;
          }
        }
        if (sdkRoot == nil) {
          fprintf(stderr,"Unknown or unsupported SDK version: %s\n",argv[i]);
          [self showSDKs];
          exit(EXIT_FAILURE);
        }
      } else if (strcmp(argv[i], "--family") == 0) {
        i++;
        family = [NSString stringWithUTF8String:argv[i]];
      } else if (strcmp(argv[i], "--uuid") == 0) {
        i++;
        uuid = [NSString stringWithUTF8String:argv[i]];
      } else if (strcmp(argv[i], "--setenv") == 0) {
        i++;
        NSArray *parts = [[NSString stringWithUTF8String:argv[i]] componentsSeparatedByString:@"="];
        [environment setObject:[parts objectAtIndex:1] forKey:[parts objectAtIndex:0]];
      } else if (strcmp(argv[i], "--env") == 0) {
        i++;
        NSString *envFilePath = [[NSString stringWithUTF8String:argv[i]] expandPath];
        environment = [NSDictionary dictionaryWithContentsOfFile:envFilePath];
        if (!environment) {
          fprintf(stderr, "Could not read environment from file: %s\n", argv[i]);
          [self printUsage];
          exit(EXIT_FAILURE);
        }
      } else if (strcmp(argv[i], "--stdout") == 0) {
        i++;
        stdoutPath = [[NSString stringWithUTF8String:argv[i]] expandPath];
        NSLog(@"stdoutPath: %@", stdoutPath);
      } else if (strcmp(argv[i], "--stderr") == 0) {
        i++;
        stderrPath = [[NSString stringWithUTF8String:argv[i]] expandPath];
        NSLog(@"stderrPath: %@", stderrPath);
      } else if (strcmp(argv[i], "--args") == 0) {
        i++;
        break;
      } else {
        fprintf(stderr, "unrecognized argument:%s\n", argv[i]);
        [self printUsage];
        exit(EXIT_FAILURE);
      }
    }
    NSMutableArray *args = [NSMutableArray arrayWithCapacity:(argc - i)];
    for (; i < argc; i++) {
      [args addObject:[NSString stringWithUTF8String:argv[i]]];
    }

    if (sdkRoot == nil) {
      sdkRoot = [DTiPhoneSimulatorSystemRoot defaultRoot];
    }

    /* Don't exit, adds to runloop */
    [self launchApp:appPath
         withFamily:family
               uuid:uuid
        environment:environment
         stdoutPath:stdoutPath
         stderrPath:stderrPath
               args:args];
  } else {
    if (argc == 2 && strcmp(argv[1], "--help") == 0) {
      [self printUsage];
      exit(EXIT_SUCCESS);
    } else if (argc == 2 && strcmp(argv[1], "--version") == 0) {
      printf("%s\n", IOS_SIM_VERSION);
      exit(EXIT_SUCCESS);
    } else {
      fprintf(stderr, "Unknown command\n");
      [self printUsage];
      exit(EXIT_FAILURE);
    }
  }
}

@end
