/*
 * See the LICENSE file for the license on the source code in this file.
 */

#import <Foundation/Foundation.h>
#import <iPhoneSimulatorRemoteClient/iPhoneSimulatorRemoteClient.h>
#import "version.h"

@interface iPhoneSimulator : NSObject <DTiPhoneSimulatorSessionDelegate> {
@private
  DTiPhoneSimulatorSystemRoot *sdkRoot;
  NSFileHandle *stdoutFileHandle;
  NSFileHandle *stderrFileHandle;
  BOOL exit_on_startup;
  BOOL verbose;
}

- (void)runWithArgc:(int)argc argv:(char **)argv;

- (void)createStdioFIFO:(NSFileHandle **)fileHandle ofType:(NSString *)type atPath:(NSString **)path;
- (void)removeStdioFIFO:(NSFileHandle *)fileHandle atPath:(NSString *)path;

@end
