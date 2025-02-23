import subprocess
import time
import json
import argparse

class TestRunner:
    def __init__(self, namespace: str, repo_url: str, commit: str, test_cmd: str, project_type: str):
        self.namespace = namespace
        self.repo_url = repo_url
        self.commit = commit
        self.test_cmd = test_cmd
        self.project_type = project_type
        self.result = {"output": {"kubectl_errors": []}}

    def run_bash_script(self, script_path: str) -> subprocess.CompletedProcess:
        """Execute bash script in the project directory"""
        try:
            # Run the script in the current directory (assumed to be in the project folder)
            result = subprocess.run(
                [script_path],  # Running the script directly, e.g., ./git-commands
                capture_output=True,
                text=True,
                check=True,
                cwd="./"  # Ensures that the current directory is used for the script
            )
            return result
        except subprocess.CalledProcessError as e:
            # Handle error case if the script fails
            self.result["output"]["kubectl_errors"].append({
                "command": f"'{script_path}'",
                "error": e.stderr.strip()
            })
            raise

    def execute_test_run(self) -> dict:
        """Main execution flow returning JSON results"""
        start_time = time.time()

        try:
            self.result["steps"] = []

            # Run the bash script in the project directory
            self._add_step("Running bash script", "bash_script_execution")
            script_path = "./git-commands"  # Path to your bash script in the project directory
            result = self.run_bash_script(script_path)

            # Capture script results
            self.result["output"]["stdout"] = result.stdout
            self.result["output"]["stderr"] = result.stderr
            self.result["success"] = True
            self.result["status"] = "passed"

        except subprocess.CalledProcessError as e:
            self.result["status"] = "failed"
            self.result["success"] = False
            if not self.result["output"]["stdout"]:
                self.result["output"]["stdout"] = e.stdout
            if not self.result["output"]["stderr"]:
                self.result["output"]["stderr"] = e.stderr
        except Exception as e:
            self.result["status"] = "error"
            self.result["output"]["stderr"] = str(e)
        finally:
            self.result["duration"] = round(time.time() - start_time, 2)

        return self.result

    def _add_step(self, description: str, step_id: str):
        """Track execution steps"""
        self.result["steps"].append({
            "step": step_id,
            "description": description,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        })


def main():
    parser = argparse.ArgumentParser(description='Single Commit Test Runner')
    parser.add_argument('-n', '--namespace', required=True, help='Target namespace')
    parser.add_argument('-r', '--repo-url', required=True, help='Git repository URL')
    parser.add_argument('-c', '--commit', required=True, help='Commit hash to test')
    parser.add_argument('-t', '--test-cmd', default='pytest tests/', help='Test command')

    args = parser.parse_args()

    runner = TestRunner(
        namespace=args.namespace,
        repo_url=args.repo_url,
        commit=args.commit,
        test_cmd=args.test_cmd,
        project_type="fastapi"  # Default to fastapi for now
    )

    result = runner.execute_test_run()
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
