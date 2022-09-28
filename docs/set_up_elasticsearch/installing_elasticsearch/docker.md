# 使用 Docker 安装 Elasticsearch

Elasticsearch 也提供 Docker 镜像。镜像使用 [centos:8](https://hub.docker.com/_/centos/) 作为基础镜像。

所有已发布的 Docker 镜像列表和版本都在 [www.docker.elastic.co](www.docker.elastic.co) 上。源文件在 [github](https://github.com/elastic/elasticsearch/blob/7.11/distribution/docker)。

软件包包含免费和订阅的特性。[开始 30 天的试用](https://www.elastic.co/guide/en/elasticsearch/reference/current/license-settings.html)，尝试所有功能。

## 拉取镜像

Docker 上获取 Elasticsearch，简单到只要向 Elastic Docker 仓库发出 docker pull 命令一样。

```bash
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.11.2
```

## 使用 Docker 启动单节点集群

要启动单节点 Elasticsearch 集群进行开发或测试，请指定[单节点发现](/set_up_elasticsearch/bootstrap?id=单节点发现)以绕过[启动检查](/set_up_elasticsearch/bootstrap)：

```bash
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.11.2
```

## 使用 Docker Compose 启动多节点集群

为了在 Docker 中启动和运行一个三节点 Elasticsearch 集群，你可以使用 Docker Compose：

- 创建一个 `docker-compose.yml` 文件：

```yaml
version: '2.2'
services:
  es01:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.11.2
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic
  es02:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.11.2
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data02:/usr/share/elasticsearch/data
    networks:
      - elastic
  es03:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.11.2
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - data03:/usr/share/elasticsearch/data
    networks:
      - elastic

volumes:
  data01:
    driver: local
  data02:
    driver: local
  data03:
    driver: local

networks:
  elastic:
    driver: bridge
```

?> 例子中的 `docker-compose.yml` 使用环境变量 `ES_JAVA_OPTS` 手工设置堆大小为 512 MB。我们不推荐在生产环境使用 `ES_JAVA_OPTS`。参看[手工设置堆大小](/set_up_elasticsearch/installing_elasticsearch/docker?id=手工设置堆大小)。

这个示例 Docker Compose 文件，提供了一个三节点 Elasticsearch 集群。节点 `es01` 监听 `localhost:9200`，`es02` 和 `es03` 通过 Docker 网络与 `es01` 通信。

请注意此配置在所有网络接口上暴露端口 9200，并且考虑到 Docker 怎么在 Linux 上操作 `iptables`，这意味着你的 Elasticsearch 集群可以公开访问，可能会忽略任何防火墙设置。如果你不想暴露端口 9200，转而使用反向代理，在 docker-compose.yml 文件中用 `127.0.0.1:9200:9200` 替代 `9200:9200`。Elasticsearch 将只能从主机自身访问。

[Docker 命名卷](https://docs.docker.com/storage/volumes) `data01`、`data02` 和 `data03` 存储节点数据目录，以便重启时数据持续存在。如果他们不存在，docker-compose 将会在你创建集群时创建他们。

1. 确保 Docker Engine 分配了至少 4 GiB 内存。在 Docker 桌面中，你可以在首选项（macOS）或设置（Windows）的高级选项卡中配置资源使用。

?> 在 Linux 上，Docker Compose 未与 Docker 一起预装。在 docs.docker.com 查看安装指南：[在 Linux 安装 Compose](https://docs.docker.com/compose/install)

2. 运行 docker-compose 以启动集群：

```bash
docker-compose up
```

3. 提交请求 `_cat/nodes` 查看节点是否启动运行

```bash
curl -X GET "localhost:9200/_cat/nodes?v=true&pretty"
```

日志消息进入控制台，由配置的 Docker 日志驱动处理。默认情况下，你可以使用 `docker logs` 访问日志。如果你更想 Elasticsearch 容器把日志写入磁盘，设置环境变量 `ES_LOG_STYLE` 为 `file`。这将导致 Elasticsearch 使用与其他 Elasticsearch 分发格式相同的配置。

要停止集群，运行 `docker-compose down`。当你使用 `docker-compose up` 重启集群，Docker 卷中的数据将被保存和加载。为了在停止集群时删除数据卷，指定 `-v` 选项： `docker-compose down -v`。

### 启动开启 TLS 的多节点集群

参阅 [在Elasticsearch Docker 容器的加密通信](/secure/encrypt/docker)和[在 Docker 中开启 TLS 运行 Elastic 栈](https://www.elastic.co/guide/en/elastic-stack-get-started/7.11/get-started-docker.html#get-started-docker-tls)。

## 在生产环境使用 Docker 镜像

以下要求和建议适用于生产环境中在 Docker 中运行 Elasticsearch。

### 设置 `vm.max_map_count` 至少为 `262144`

在生产环境使用，`vm.max_map_count` 内核设置必须至少为 `262144`。

如何设置 `vm.max_map_count` 基于你的平台：

- Linux

`vm.max_map_count` 应该永久设置在 `/etc/sysctl.conf`：

```bash
grep vm.max_map_count /etc/sysctl.conf
vm.max_map_count=262144
```

在运行的系统中应用此配置，执行：

```bash
sysctl -w vm.max_map_count=262144
```

- 带 [Mac 版 Docker](https://docs.docker.com/docker-for-mac) 的 macOS

`vm.max_map_count` 设置必须在 xhyve 虚机中设置：

a. 从命令行运行：

```bash
screen ~/Library/Containers/com.docker.docker/Data/vms/0/tty
```

b. 按回车，使用 "sysctl" 配置 `vm.max_map_count` ：

```bash
sysctl -w vm.max_map_count=262144
```

c. 退出 `screen` 会话，按 `Ctrl a d`

- 带 [Docker 桌面版](https://www.docker.com/products/docker-desktop)的 Windows 和 macOS

`vm.max_map_count` 必须通过 docker-machine 设置。

```bash
docker-machine ssh
sudo sysctl -w vm.max_map_count=262144
```

- 带 [Docker WSL 2 后端桌面版](https://docs.docker.com/docker-for-windows/wsl/)的 Windows

`vm.max_map_count` 必须在 `docker-desktop` 容器中设置。

```powershell
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144
```

### 配置文件必须可被用户 `elasticsearch` 用户读取

默认情况下，Elasticsearch 通过 uid:gid `1000:0`，以用户 `elasticsearch` 在容器中运行。

!> 一个例外是 [OpenShift](https://docs.openshift.com/container-platform/3.6/creating_images/guidelines.html#openshift-specific-guidelines)，它使用任意分配的用户 ID 运行容器。OpenShift 显示的持久卷的 gid 设置为 0，它可以无需调整的运行。

如果你要绑定挂载本地目录或文件，它必须可被用户 `elasticsearch` 读取。此外，此用户对 [配置、数据和日志目录](/set_up_elasticsearch/important_es_config?id=路径设置)有写权限（Elasticsearch 需要对 `config` 目录有写权限，这样它才能生成密钥库）。一个好的策略是为本地目录 gid `0` 分配组访问权限。

例如，要准备本地目录以通过绑定挂载来存储数据，按以下操作：

```bash
mkdir esdatadir
chmod g+rwx esdatadir
chgrp 0 esdatadir
```

你也可以使用自定义 UID 和 GID 来运行 Elasticsearch 容器。除非你绑定挂载每个 `config`、`data` 和 `logs` 目录，否则必须为 `docker run` 传递命令行选项 `--group-add 0`。这样可以确保运行 Elasticsearch 的用户也是容器 `root` （GID 0）组的成员。

最后，你还可以通过环境变量 `TAKE_FILE_OWNERSHIP` 强制容器更改用于[数据和日志目录](/set_up_elasticsearch/important?id=路径设置)的绑定挂载的所有权。当你这样做的时候，它们将属于 uid:gid `1000:0`，它提供了 Elasticsearch 进程所需的读写访问权限。

### 为 nofile 和 nproc 增加 ulimit

必须为 Elasticsearch 容器提供 [nofile](/set_up_elasticsearch/important_system_config/config) 和 [nproc](/set_up_elasticsearch/bootstrap/thread) 增加 ulimit。验证 Docker 的守护进程是否的 [init system](https://github.com/moby/moby/tree/ea4d1243953e6b652082305a9c3cda8656edab26/contrib/init) 是否将它们设置为可接受的值。

为了检测 Docker 守护进程默认的 ulimit，执行：

```bash
docker run --rm centos:8 /bin/bash -c 'ulimit -Hn && ulimit -Sn && ulimit -Hu && ulimit -Su'
```

如果需要，在守护进程中调整他们，或者在每个容器中重载他们。例如，使用 `docker run` 时，设置：

```bash
--ulimit nofile=65535:65535
```

### 禁用 swapping

为了提高性能和节点稳定性，swapping 需要禁用。有关执行此操作的更多信息，请参阅 [禁用 swapping](/set_up_elasticsearch/important_system_config/swapping)。

如果你选择 `bootstrap.memory_lock: true`，你也需要在 Docker 守护进程中定义 `memlock: true` 限定，或者如[示例 compose 文件](/set_up_elasticsearch/installing_elasticsearch/docker?id=使用-Docker-Compose-启动多节点集群)中显示的设置。当使用 `docker run`，你可以指定：

`-e "bootstrap.memory_lock=true" --ulimit memlock=-1:-1`

### 随机发布端口

镜像[暴露](https://docs.docker.com/engine/reference/builder/#/expose) TCP 端口 9200 和 9300。对生产环境集群，推荐通过 `--publish-all` 随机发布端口，除非你为每个主机固定一个容器。

### 手工设置堆大小

默认情况下，Elasticsearch 基于节点的[角色](/set_up_elasticsearch/configuring_elasticsearchnode?id=节点角色)和节点容器总可用内存，自动地设置 JVM 堆。对大多数生产环境，我们推荐默认大小设置。如果有需要，你可以通过手工设置 JVM 堆大小来重载默认设置。

为了在生产环境手工设置堆大小，绑定挂载包含了你期望的[堆大小](/set_up_elasticsearch/configuring_elasticsearchadvanced?id=设置-JVM-堆大小)设置的 [JVM 选项](/set_up_elasticsearch/configuring_elasticsearchjvm)文件（在 `/usr/share/elasticsearch/configuring_elasticsearchjvm.options.d`中）。

用于测试的话，你可以通过环境变量 `ES_JAVA_OPTS` 手工设置堆大小。例如，要用 16 GB，通过 `docker run` 指定 `-e ES_JAVA_OPTS="-Xms16g -Xmx16g"`。`ES_JAVA_OPTS` 重载所有其他 JVM 选项。在生产环境，我们不推荐使用 `ES_JAVA_OPTS`。上方的 `docker-compose.yml` 可以看到设置堆大小为 512 MB。

### 部署固定为指定的镜像版本

将部署固定为指定的 Elasticsearch Docker 镜像。例如 `docker.elastic.co/elasticsearch/elasticsearch:7.11.2`。

### 始终绑定数据卷

出于以下原因，你应该对 `/usr/share/elasticsearch/data` 使用卷绑定：

1. 如果容器被杀死，Elasticsearch 节点数据不会丢失
2. Elasticsearch 对 I/O 敏感，而 Docker 存储驱动不适合快速 I/O
3. 允许使用高级 [Docker 卷插件](https://docs.docker.com/engine/extend/plugins/#volume-plugins)

### 禁止使用 `loop-lvm` 模式

如果你正在使用 devicemapper 存储驱动，不要使用默认的 `loop-lvm` 模式。配置 docker-engine 以使用 [direct-lvm](https://docs.docker.com/engine/userguide/storagedriver/device-mapper-driver/#configure-docker-with-devicemapper)。

### 集中你的日志

考虑使用不同的[日志驱动](https://docs.docker.com/engine/admin/logging/overview/)来集中日志。还要注意，默认的 json-file 日志驱动不适合生产环境。

## 使用 Docker 配置 Elasticsearch

当你在 Docker 中运行时， [Elasticsearch 配置文件](/set_up_elasticsearch/config?id=配置文件位置)从 `/usr/share/elasticsearch/configuring_elasticsearch` 加载。为了使用自定义配置文件，你要[绑定挂载文件](/set_up_elasticsearch/installing_elasticsearch/docker?id=挂载-Elasticsearch-配置文件)到镜像中的配置文件上。

你可以通过环境变量设置独立的 Elasticsearch 配置参数。[示例 compose 文件](/set_up_elasticsearch/installing_elasticsearch/docker?id=使用-Docker-Compose-启动多节点集群)和[单节点示例](/set_up_elasticsearch/installing_elasticsearch/docker?id=使用-Docker-启动单节点集群)就用的这种方法。

要使用文件内容设置环境变量，给环境变量名字加上后缀 `_FILE`。这对于秘密传输配置（如密码）给 Elasticsearch，而不是直接指定它们非常有用。

例如，为了从文件设置 Elasticsearch 的启动密码，你可以绑定挂载这个文件，然后在挂载路径中设置环境变量`ELASTIC_PASSWORD_FILE`。如果你挂载的密码文件为 `/run/secrets/bootstrapPassword.txt`,如下指定：

```bash
-e ELASTIC_PASSWORD_FILE=/run/secrets/bootstrapPassword.txt
```

你还可以通过传递 Elasticsearch 配置参数作为命令行选项，来重载默认的命令。例如：

```bash
docker run <various parameters> bin/elasticsearch -Ecluster.name=mynewclustername
```

虽然绑定挂载配置文件通常在生产环境是首选方法，你也可以创建包含你自己配置的[自定义 Docker 镜像](/set_up_elasticsearch/installing_elasticsearch/docker?id=使用自定义-Docker-镜像)。

### 挂载 Elasticsearch 配置文件

创建自定义配置文件，将其绑定挂载到 Docker 镜像的相应文件上。例如，使用 `docker run` 绑定挂载 `custom_elasticsearch.yml`，如下指定：

```bash
-v full_path_to/custom_elasticsearch.yml:/usr/share/elasticsearch/configuring_elasticsearchelasticsearch.yml
```

!> 容器以用户 `elasticsearch`，使用 uid:gid `1000:0` 运行 Elasticsearch。绑定挂载的主机目录和文件，必须能被此用户访问，且数据和日志目录必须能被此用户写入。

### 挂载 Elasticsearch 密钥库

默认情况下，Elasticsearch 会为安全设置自动生成密钥库文件。这个文件是混淆的，但没有加密。如果你想使用密码加密你的[安全设置](/set_up_elasticsearch/configuring_elasticsearchsecure_settings)，你必须使用 `elasticsearch-keystore` 程序去创建一个密码保护的密钥库，然后绑定挂载它到容器中文件 `/usr/share/elasticsearch/configuring_elasticsearchelasticsearch.keystore`。为了在启动时向 Docker 容器提供密码，将 Docker 的环境变量值 `KEYSTORE_PASSWORD` 设置为密码值。例如，`docker run` 命令可以有以下的选项：

```bash
-v full_path_to/elasticsearch.keystore:/usr/share/elasticsearch/configuring_elasticsearchelasticsearch.keystore
-E KEYSTORE_PASSWORD=mypassword
```

### 使用自定义 Docker 镜像

在一些环境中，准备包含你配置的自定义镜像更有意义。实现这一点的 `Dockerfile` 可能如下一样简单：

```bash
FROM docker.elastic.co/elasticsearch/elasticsearch:7.11.2
COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/configuring_elasticsearch
```

你可以这样构建和运行镜像：

```bash
docker build --tag=elasticsearch-custom .
docker run -ti -v /usr/share/elasticsearch/data elasticsearch-custom
```

一些插件需要额外的安全权限。你必须通过以下方式明确接受它们：

- 当你运行 Docker 镜像时，附加 `tty` 并在提供时允许权限。
- 通过向插件安装命令添加 `--batch` 标志来检查安全权限，并且接受它们（如果合适）

参阅[插件管理](https://www.elastic.co/guide/en/elasticsearch/plugins/7.11/_other_command_line_parameters.html)，获取更多信息。

## 下一步

你现在有一个测试 Elasticsearch 环境部署好。在你使用 Elasticsearch 正式开始开发或者生产之前，你必须做一些额外的设置：

- 学习如何配置 [Elasticsearch](/set_up_elasticsearch/config)。
- 配置[重要的 Elasticsearch 设置](/set_up_elasticsearch/important_es_config)。
- 配置[重要的系统设置](/set_up_elasticsearch/important_system_config)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
