pipeline {
    agent {
        node {
            label 'slave_node_ruby'
        }
    }
    stages {
        stage('Test') { 
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }
        stage('Build') { 
            steps {
                sh 'npm run build:shopify'
                sh 'cd dist'
                sh 'ls -la'
                }
        }
        stage('Deploy') { 
            steps {
                sshPublisher(publishers: [sshPublisherDesc(configName: 'gcp-shopify-plugin-test', transfers: [sshTransfer(excludes: '', execCommand: '', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '/opt/shopify_plugin/views/widget/', remoteDirectorySDF: false, removePrefix: 'dist/', sourceFiles: 'dist/*')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                sshPublisher(publishers: [sshPublisherDesc(configName: 'gcp-shopify-plugin-test', transfers: [sshTransfer(excludes: '', execCommand: 'cd /opt/shopify_plugin/app/widget-assets && ls -la && sudo supervisorctl restart all', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '/opt/shopify_plugin/app/widget-assets', remoteDirectorySDF: false, removePrefix: 'dist/widget-assets/', sourceFiles: 'dist/widget-assets/*')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                }
        }
    }
    post {
      // only triggered when blue or green sign
        success {
            slackSend (channel: "#test", color: '#439FE0', message: "Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
        // triggered when red sign
        failure {
            slackSend (channel: "#test", color: '#439FE0', message: "Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
        // trigger every-works
        always {
            slackSend (channel: "#test", color: '#439FE0', message: "Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
    }
}
