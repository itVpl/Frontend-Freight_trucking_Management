pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds(); timeout(time: 45, unit: 'MINUTES') }

  parameters {
    string(name: 'FRONTEND_DIR', defaultValue: '.', description: 'Frontend folder (use "." if at repo root)')
    booleanParam(name: 'LIGHT_BUILD', defaultValue: true, description: 'Light build (no minify, no sourcemap)')
    string(name: 'NODE_HEAP_MB', defaultValue: '2048', description: 'Node heap in MB (e.g. 1536/2048)')
  }

  environment {
    APP_DIR = '/var/www/app'
    CI = 'true'
    NPM_CONFIG_FUND = 'false'
    NPM_CONFIG_AUDIT = 'false'
    NPM_CONFIG_PROGRESS = 'false'
    NPM_CONFIG_PREFER_OFFLINE = 'true'
  }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Node check') {
      steps {
        sh 'node -v || true'
        sh 'npm -v || true'
      }
    }

    stage('Prep workspace') {
      steps {
        sh '''
          set -e
          rm -rf "${WORKSPACE}/node_modules" "${WORKSPACE}/${FRONTEND_DIR}/node_modules" || true
        '''
      }
    }

    stage('Install deps') {
      steps {
        sh '''
          set -e
          cd "${FRONTEND_DIR}"
          npm ci --no-audit --fund=false --prefer-offline
          npm config set fund false
          npm config set audit false
          npm config set progress false
          npm config set prefer-offline true
        '''
      }
    }

    stage('Build (memory-aware)') {
      steps {
        sh '''
          set -e
          cd "${FRONTEND_DIR}"
          export NODE_OPTIONS="--max-old-space-size=${NODE_HEAP_MB}"

          MINIFY_FLAG=""
          SOURCEMAP_FLAG=""
          if [ "${LIGHT_BUILD}" = "true" ]; then
            MINIFY_FLAG="--minify false"
            SOURCEMAP_FLAG="--sourcemap false"
          fi

          npm run build -- --logLevel info $MINIFY_FLAG $SOURCEMAP_FLAG
        '''
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          set -e
          APP_DIR="${APP_DIR}"
          REL_DIR="$APP_DIR/releases/$(date +%Y%m%d-%H%M%S)"

          # auto-detect build output
          if [ -d "$WORKSPACE/${FRONTEND_DIR}/dist" ]; then
            SRC="$WORKSPACE/${FRONTEND_DIR}/dist"
          elif [ -d "$WORKSPACE/${FRONTEND_DIR}/build" ]; then
            SRC="$WORKSPACE/${FRONTEND_DIR}/build"
          elif [ -d "$WORKSPACE/dist" ]; then
            SRC="$WORKSPACE/dist"
          elif [ -d "$WORKSPACE/build" ]; then
            SRC="$WORKSPACE/build"
          else
            echo "Build folder not found (dist/ or build/). Check FRONTEND_DIR."
            exit 1
          fi

          echo "Using build source: $SRC"

          mkdir -p "$REL_DIR"
          cp -r "$SRC/"* "$REL_DIR/"

          # switch current to new release (atomic)
          ln -sfn "$REL_DIR" "$APP_DIR/current"

          # keep only last 3 releases
          cd "$APP_DIR/releases"
          ls -1t | tail -n +4 | xargs -r rm -rf

          # reload nginx
          sudo /usr/sbin/nginx -t
          sudo /bin/systemctl reload nginx

          echo "Deployed release: $(readlink -f $APP_DIR/current)"
        '''
      }
    }
  }

  post {
    success { echo "✅ Deployed successfully to ${env.APP_DIR}" }
    failure { echo "❌ Build/Deploy failed. Check console output." }
  }
}
