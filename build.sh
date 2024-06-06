#!/bin/bash

# Set Java home
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-amd64

# Install Maven
MAVEN_VERSION=3.8.6
MAVEN_DIR=apache-maven-$MAVEN_VERSION
MAVEN_TAR=$MAVEN_DIR-bin.tar.gz

# Download Maven
wget https://downloads.apache.org/maven/maven-3/$MAVEN_VERSION/binaries/$MAVEN_TAR

# Extract Maven
tar -xzf $MAVEN_TAR

# Set Maven environment variables
export M2_HOME=$PWD/$MAVEN_DIR
export PATH=$M2_HOME/bin:$PATH

# Clean and build the project
mvn clean package

# Run the application
mvn exec:java
