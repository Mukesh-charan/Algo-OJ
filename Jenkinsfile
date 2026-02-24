pipeline {
    agent any

    environment {
        FRONTEND_DIR = "Frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Node Version') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'Frontend/dist/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo 'Frontend build completed successfully!'
        }
        failure {
            echo 'Frontend build failed!'
        }
    }
}
